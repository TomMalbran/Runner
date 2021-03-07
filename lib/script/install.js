const Command = require("../utils/command");
const Input   = require("../utils/input");
const Output  = require("../utils/output");



/**
 * Runs the Install script
 * @param {Object} config
 * @param {Object} args
 * @returns {Promise}
 */
async function run(config, args) {
    // Run the Command
    switch (config.type) {
    case "react": {
        Output.subtitle("Installing a React Module");
        const module = await Input.valueOrPrompt(args.module, "module");
        Command.cdIf(config);
        Command.exec(`npm install --save ${module}`);
        break;
    }

    case "flutter": {
        Output.subtitle("Installing a Flutter Module");
        Command.cdIf(config);
        Command.exec("flutter pub get");
        break;
    }

    case "composer": {
        Output.subtitle("Installing a Composer Module");
        const module = await Input.valueOrPrompt(args.module, "module");
        Command.cdIf(config);
        Command.exec(`composer require ${module}`);
        break;
    }

    default:
        Output.error("The type is invalid");
    }

    return true;
};



// The public API
module.exports = run;
