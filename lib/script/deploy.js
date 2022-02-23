const Input   = require("../utils/input");
const Output  = require("../utils/output");
const Command = require("../utils/command");
const Config  = require("../utils/config");
const Path    = require("path");



/**
 * Runs the Deploy script
 * @param {Object} config
 * @param {Object} args
 * @returns {Promise}
 */
async function run(config, args) {
    if (args.dev) {
        Output.subtitle("Deploying to Dev");
    } else if (args.stage) {
        Output.subtitle("Deploying to Stage");
    } else if (args.prod) {
        Output.subtitle("Deploying to Production");
    }
    Output.date();

    if (!config.user || !config.pass || !config.host) {
        Output.exit("User, pass and host are required");
        return;
    }
    if (!config.uploads) {
        Output.exit("The uploads are required");
        return;
    }

    if (args.prod) {
        const response = await Input.confirm("Are you sure you want to deploy to Production?");
        Output.line();
        if (!response) {
            Output.exit("The deploy was stopped");
            return;
        }
    }
    Output.line();

    Output.step("Updating the Build Number");
    Command.execSilent("runner version build");
    config.build = Number(config.build) + 1;
    Output.tab("Version", `${config.version}-${config.build}`);
    Output.line();

    if (config.minify) {
        Output.step("Minifying the CSS");
        Command.execSilent("runner minify");
        Output.line();
    }

    if (config.uploads.length) {
        for (const uconf of config.uploads) {
            upload(uconf, config, args);
        }
    } else {
        upload(config.uploads, config, args);
    }

    if (args.files) {
        Output.step("Uploading the Files");
        Command.ftp(config, "", `${config.local}files`, `${config.remote}files`);
        Output.line();
    }

    if (config.migration) {
        Output.step("Executing the Migrations");

        const url       = `${config.migration}migrations.php`;
        const maxLength = "recreate".length;
        Output.bold("Options");
        Output.tab("delete",   args.delete   ? "yes" : "no", maxLength);
        Output.tab("recreate", args.recreate ? "yes" : "no", maxLength);
        Output.line();

        const response = await Command.fetch(url, "POST", {
            "delete"   : args.delete   ? 1 : 0,
            "recreate" : args.recreate ? 1 : 0,
        });
        Output.html(response);
    }

    return true;
}

/**
 * Uploads the Files
 * @param {Object} uconfig
 * @param {Object} config
 * @param {Object} args
 * @returns {Void}
 */
function upload(uconfig, config, args) {
    const from = Path.resolve(config.local, uconfig.path || "");
    const to   = Path.resolve(config.remote, uconfig.to || "");

    switch (uconfig.type) {
    case "react": {
        Output.step(`Building the ${uconfig.name}`);
        const env = Config.getReactEnv(args);
        Command.pushdIf(uconfig);
        Command.exec(`${env}npm run build`);
        Command.popdIf(uconfig);
        Output.line();

        Output.step(`Uploading the ${uconfig.name}`);
        Command.ftp(config, "-r", `${from}/build`, to);
        Command.ftp(config, "-e", `${from}/build/static`, `${to}/static`);
        Output.line();
        break;
    }

    case "flutter": {
        Output.step(`Building the ${uconfig.name}`);
        const file = Config.getFlutterFile(args);
        Command.pushdIf(uconfig);
        Command.exec(`flutter build web -t lib/main/${file}Web.dart`);
        Command.popdIf(uconfig);
        Output.line();

        Output.step(`Uploading the ${uconfig.name}`);
        Command.ftp(config, "-r", `${from}/build/web`, to);
        Command.ftp(config, "-e", `${from}/build/web/assets`, `${to}/assets`);
        Command.ftp(config, "-e", `${from}/build/web/icons`,  `${to}/icons`);
        Output.line();
        break;
    }

    case "site": {
        Output.step(`Building the ${uconfig.name}`);
        Command.execSilent("runner minify");
        Output.line();

        Output.step(`Uploading the ${uconfig.name}`);
        Command.ftp(config, uconfig.flags || "", from, to);
        Output.line();
        break;
    }

    case "files": {
        Output.step(`Uploading the ${uconfig.name}`);
        Command.ftp(config, uconfig.flags || "", from, to);
        Output.line();
        break;
    }

    default:
        Output.exit("The upload type is invalid");
    }
}



// The public API
module.exports = run;
