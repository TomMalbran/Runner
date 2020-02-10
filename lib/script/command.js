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
    Output.title("Running a Command");

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
        Command.exec(`flutter pub run ${command}`);
        break;
    }
    
    default:
        Output.error("The type is invalid");
        return;
    }

    Output.done();
};



// The public API
module.exports = run;
