const Input   = require("../utils/input");
const Output  = require("../utils/output");
const Command = require("../utils/command");
const Config  = require("../utils/config");
const Path    = require("path");
const FS      = require("fs");



/**
 * Runs the Deploy script
 * @param {object} config
 * @param {object} args
 * @param {object} env
 * @returns {Promise}
 */
async function run(config, args, env) {
    if (config.title) {
        Output.subtitle(config.title);
    } else {
        Output.subtitle(`Deploying to ${env.name}`);
    }
    Output.date();
    const startTime = Date.now();


    // Validate some Stuff
    if (!config.user || !config.pass || !config.host) {
        Output.exit("User, pass and host are required");
        return;
    }
    if (!config.uploads && !config.preUploads) {
        Output.exit("The uploads are required");
        return;
    }

    if (env.isProd && !config.isSilent) {
        const response = await Input.confirm("Are you sure you want to deploy to Production?");
        Output.line();
        if (!response) {
            Output.exit("The deploy was stopped");
            return;
        }
    }
    Output.line();


    // Update the Build
    Config.updateBuild(config, args);

    // The Build is written in the files of the project until the deploy ends, so it is
    // restored once, whether the deploy ends, fails or is canceled with Ctrl+C. The
    // signal stops the command that is running, and the deploy is ended before the next
    // step, as the steps run one after the other and the handler only runs between them
    let isRestored = false;
    const restoreBuild = () => {
        if (!isRestored) {
            isRestored = true;
            Config.restoreBuild();
        }
    };
    process.once("SIGINT", () => {
        restoreBuild();
        Output.exit("The deploy was canceled");
    });

    try {
        // Execute the Commands that prepare the Files, like generated ones the builds use.
        // Nothing is uploaded when one fails, as the builds would use what it did not make
        for (const command of config.preCommands || []) {
            await waitSignals();
            Output.step(command.title);
            if (Command.execCode(command.command) !== 0) {
                restoreBuild();
                Output.exit("The command failed and the deploy was stopped");
                return;
            }
            Output.line();
        }

        // Upload the Files
        await uploadAll(config.preUploads, config, env);
        await uploadAll(config.uploads, config, env);

        // Execute the Migration
        if (config.migration) {
            Output.step("Executing the Migrations");
            const url       = `${config.migration}migrations.php`;
            const maxLength = "delete".length;
            Output.bold("Options");
            Output.tab("url",    url, maxLength);
            Output.tab("delete", args.delete ? "yes" : "no", maxLength);
            Output.line();

            const response = await Command.fetch(url, "POST", {
                "delete" : args.delete ? 1 : 0,
            });
            Output.html(response);
            Output.line();
        }

        // Execute Commands
        for (const command of config.commands || []) {
            await waitSignals();
            Output.step(command.title);
            Command.exec(command.command);
            Output.line();
        }
    } finally {
        restoreBuild();
    }

    // Print the Time
    const endTime = Date.now();
    Output.execution(startTime, endTime);

    return true;
}

/**
 * Uploads all the Files
 * @param {object} uploads
 * @param {object} config
 * @param {object} env
 * @returns {void}
 */
async function uploadAll(uploads, config, env) {
    if (!uploads) {
        return;
    }
    if (uploads.length) {
        for (const uploadConfig of uploads) {
            await waitSignals();
            await upload(uploadConfig, config, env);
        }
        return;
    }
    if (uploads.type) {
        await waitSignals();
        await upload(uploads, config, env);
    }
}

/**
 * Uploads the Files
 * @param {object} uploadConfig
 * @param {object} config
 * @param {object} env
 * @returns {void}
 */
async function upload(uploadConfig, config, env) {
    const from   = Path.resolve(config.local  || "", uploadConfig.path || "");
    const to     = Path.resolve(config.remote || "/", uploadConfig.to   || "");
    const useSSH = Boolean(uploadConfig.ssh ?? config.ssh);

    switch (uploadConfig.type) {
    case "react": {
        Output.step(`Building the ${uploadConfig.name}`);
        const cmd = Config.getReactEnv(env);
        Command.pushdIf(uploadConfig);
        Command.exec(`${cmd}npm run build`);
        Command.popdIf(uploadConfig);
        Output.line();

        await waitSignals();
        Output.step(`Uploading the ${uploadConfig.name}`);
        uploadBuild(useSSH, config, `${from}/build`, to, [ "static", "assets" ]);
        Output.line();
        break;
    }

    case "flutter": {
        Output.step(`Building the ${uploadConfig.name}`);
        const file = Config.getFlutterFile(env);
        Command.pushdIf(uploadConfig);
        Command.exec(`flutter build web -t lib/main/${file}Web.dart --source-maps`);
        Command.popdIf(uploadConfig);
        Output.line();

        await waitSignals();
        Output.step(`Uploading the ${uploadConfig.name}`);
        uploadBuild(useSSH, config, `${from}/build/web`, to, [ "assets", "icons", "splash" ]);
        Output.line();
        break;
    }

    case "site": {
        Output.step(`Building the ${uploadConfig.name}`);
        Command.execSilent("runner minify");
        Output.line();

        await waitSignals();
        Output.step(`Uploading the ${uploadConfig.name}`);
        uploadDir(useSSH, config, Boolean(uploadConfig.delete), uploadConfig.flags, from, to);
        Output.line();
        break;
    }

    case "files": {
        Output.step(`Uploading the ${uploadConfig.name}`);
        uploadDir(useSSH, config, Boolean(uploadConfig.delete), uploadConfig.flags, from, to);
        Output.line();
        break;
    }

    case "file": {
        Output.step(`Uploading the file ${uploadConfig.name}`);
        if (useSSH) {
            Command.sshFile(config, uploadConfig.file, to);
        } else {
            Command.ftpFile(config, uploadConfig.file, to);
        }
        Output.line();
        break;
    }

    default:
        Output.exit("The upload type is invalid");
    }
}

/**
 * Uploads a Directory through SSH or FTP, replacing the one of the server when asked
 * @param {boolean} useSSH
 * @param {object}  config
 * @param {boolean} replace
 * @param {string=} flags
 * @param {string}  from
 * @param {string}  to
 * @returns {void}
 */
function uploadDir(useSSH, config, replace, flags, from, to) {
    if (useSSH) {
        Command.ssh(config, replace, from, to);
    } else {
        Command.ftp(config, flags || (replace ? "-e" : ""), from, to);
    }
}

/**
 * Uploads a Build, merging its files and replacing the given folders of hashed files
 * @param {boolean}  useSSH
 * @param {object}   config
 * @param {string}   from
 * @param {string}   to
 * @param {string[]} folders
 * @returns {void}
 */
function uploadBuild(useSSH, config, from, to, folders) {
    // The files at the root keep their names between builds, so they are merged over the
    // old ones, and the folders of hashed files are replaced so the old builds do not pile
    // up. The other folders are not sent, as they are uploads of their own
    const existing = folders.filter((folder) => FS.existsSync(`${from}/${folder}`));
    if (useSSH) {
        Command.ssh(config, false, from, to, true);
    } else {
        Command.ftp(config, "-r", from, to);
    }
    for (const folder of existing) {
        if (useSSH) {
            Command.ssh(config, true, `${from}/${folder}`, `${to}/${folder}`);
        } else {
            Command.ftp(config, "-e", `${from}/${folder}`, `${to}/${folder}`);
        }
    }
}

/**
 * Lets the Ctrl+C that arrived during a step run its handler before the next one
 * @returns {Promise<void>}
 */
function waitSignals() {
    return new Promise((resolve) => setImmediate(resolve));
}


// The public API
module.exports = run;
