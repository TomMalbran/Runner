const Command = require("../utils/command");
const Input   = require("../utils/input");
const Output  = require("../utils/output");



/**
 * Runs the Build script
 * @param {Object} config
 * @param {Object} args
 * @returns {Promise}
 */
async function run(config, args) {
    // Run the Command
    switch (config.type) {
    case "react": {
        Output.subtitle("Running a React Command");
        const command = await Input.valueOrPrompt(args.command, "command");
        Command.cdIf(config);
        Command.exec(`npm run ${command}`);
        break;
    }

    case "node": {
        Output.subtitle("Running a Node Command");
        const command = await Input.valueOrPrompt(args.command, "command");
        Command.cdIf(config);
        Command.exec(`npm run ${command}`);
        break;
    }

    case "flutter": {
        Output.subtitle("Running a Flutter Command");
        const command = await Input.valueOrPrompt(args.command, "command");
        Command.cdIf(config);
        Command.exec("flutter pub get");
        Command.exec(`flutter pub run ${command}`);
        break;
    }

    case "cordova": {
        Output.subtitle("Running a Cordova Command");
        const command = await Input.valueOrPrompt(args.command, "command");
        Command.cdIf(config);
        Command.exec(`cordova ${command}`);
        break;
    }

    case "php": {
        Output.subtitle("Running a PHP Command");
        const command = await Input.valueOrPrompt(args.command, "command");
        Command.cdIf(config);
        Command.exec(`php ${command}.php`);
        break;
    }

    default:
        Output.error("The type is invalid");
    }

    return true;
};



// The public API
module.exports = run;
