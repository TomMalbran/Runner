const Output  = require("../utils/output");
const Command = require("../utils/command");



/**
 * Runs the Deploy script
 * @param {Object} config
 * @param {Object} args
 * @returns {Void}
 */
function run(config, args) {
    Output.title("Deploying the System");

    switch (config.type) {
    case "react":
        deployReact(config, args);
        break;
    
    default:
        Output.error("The type is invalid");
        return;
    }

    Output.done();
}

/**
 * Deploys a React System
 * @param {Object} config
 * @param {Object} args
 * @returns {Void}
 */
function deployReact(config, args) {
    if (config.dev) {
        Output.subtitle("Deploying React to Dev");
    } else if (config.stage) {
        Output.subtitle("Deploying React to Stage");
    } else {
        Output.subtitle("Deploying React to Production");
    }

    if (!config.user || !config.pass || !config.host) {
        Output.exit("User, pass and host are required");
        return;
    }

    Output.step("Updating the Version");
    Command.execSilent("runner version build");
    Output.tab("Version", `${config.version}-${Number(config.build) + 1}`);
    Output.line();
    
    Output.step("Building the App");
    Command.pushdIf(config);
    if (config.dev) {
        Command.exec("env-cmd -f .env.dev npm run build");
    } else if (config.stage) {
        Command.exec("env-cmd -f .env.stage npm run build");
    } else {
        Command.exec("npm run build");
    }
    Command.popdIf(config);
    
    Output.step("Uploading the Client");
    Command.ftp(config, "-r", `${config.local}client/build`, config.remote);
    Command.ftp(config, "-e", `${config.local}client/build/static`, `${config.remote}static`);
    Output.line();
    
    Output.step("Uploading the Server");
    Command.ftp(config, "", `${config.local}server`, `${config.remote}server`);
    Output.line();
    
    if (args.files) {
        Output.step("Uploading the Files");
        Command.ftp(config, "", `${config.local}files`, `${config.remote}files`);
        Output.line();
    }
    
    Output.step("Executing the Migrations");
    const response = await Command.fetch(`${config.url}migrations.php`, "POST", {
        "delete" : args.delete ? 1 : 0,
    });
    Output.html(response);
}



// The public API
module.exports = run;
