const Input   = require("../utils/input");
const Output  = require("../utils/output");
const Command = require("../utils/command");
const Config  = require("../utils/config");
const Path    = require("path");



/**
 * Runs the Deploy script
 * @param {Object} config
 * @param {Object} args
 * @param {Object} env
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

    // Minify the CSS
    if (config.minify) {
        Output.step("Minifying the CSS");
        Command.execSilent("runner minify");
        Output.line();
    }

    // Upload the Files
    uploadAll(config.preUploads, config, env);
    uploadAll(config.uploads, config, env);

    if (args.files) {
        Output.step("Uploading the Files");
        Command.ftp(config, "", `${config.local}files`, `${config.remote}files`);
        Output.line();
    }

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
        Output.step(command.title);
        Command.exec(command.command);
        Output.line();
    }

    // Restore the Build
    Config.restoreBuild();

    // Print the Time
    const endTime = Date.now();
    Output.execution(startTime, endTime);

    return true;
}

/**
 * Uploads all the Files
 * @param {Object} uploads
 * @param {Object} config
 * @param {Object} env
 * @returns {Void}
 */
function uploadAll(uploads, config, env) {
    if (!uploads) {
        return;
    }
    if (uploads.length) {
        for (const uploadConfig of uploads) {
            upload(uploadConfig, config, env);
        }
        return;
    }
    if (uploads.type) {
        upload(uploads, config, env);
    }
}

/**
 * Uploads the Files
 * @param {Object} uploadConfig
 * @param {Object} config
 * @param {Object} env
 * @returns {Void}
 */
function upload(uploadConfig, config, env) {
    const from = Path.resolve(config.local, uploadConfig.path || "");
    const to   = Path.resolve(config.remote, uploadConfig.to || "");

    switch (uploadConfig.type) {
    case "react": {
        Output.step(`Building the ${uploadConfig.name}`);
        const cmd = Config.getReactEnv(env);
        Command.pushdIf(uploadConfig);
        Command.exec(`${cmd}npm run build`);
        Command.popdIf(uploadConfig);
        Output.line();

        Output.step(`Uploading the ${uploadConfig.name}`);
        Command.ftp(config, "-r", `${from}/build`, to);
        Command.ftp(config, "-e", `${from}/build/static`, `${to}/static`);
        Output.line();
        break;
    }

    case "flutter": {
        Output.step(`Building the ${uploadConfig.name}`);
        const file = Config.getFlutterFile(env);
        Command.pushdIf(uploadConfig);
        Command.exec(`flutter build web -t lib/main/${file}Web.dart --web-renderer html --source-maps`);
        Command.popdIf(uploadConfig);
        Output.line();

        Output.step(`Uploading the ${uploadConfig.name}`);
        Command.ftp(config, "-r", `${from}/build/web`,        to);
        Command.ftp(config, "-e", `${from}/build/web/assets`, `${to}/assets`);
        Command.ftp(config, "-e", `${from}/build/web/icons`,  `${to}/icons`);
        Output.line();
        break;
    }

    case "site": {
        Output.step(`Building the ${uploadConfig.name}`);
        Command.execSilent("runner minify");
        Output.line();

        Output.step(`Uploading the ${uploadConfig.name}`);
        Command.ftp(config, uploadConfig.flags || "", from, to);
        Output.line();
        break;
    }

    case "files": {
        Output.step(`Uploading the ${uploadConfig.name}`);
        Command.ftp(config, uploadConfig.flags || "", from, to);
        Output.line();
        break;
    }

    case "file": {
        Output.step(`Uploading the file ${uploadConfig.name}`);
        Command.ftpFile(config, uploadConfig.file, to);
        Output.line();
        break;
    }

    default:
        Output.exit("The upload type is invalid");
    }
}



// The public API
module.exports = run;
