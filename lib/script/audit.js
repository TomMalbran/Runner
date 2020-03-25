const Command = require("../utils/command");
const Output  = require("../utils/output");



/**
 * Runs the Audit script
 * @param {Object} config
 * @param {Object} args
 * @returns {Promise}
 */
async function run(config, args) {
    Output.title("Auditing the System");

    // Run the Command
    switch (config.type) {
    case "react":
        Output.subtitle("Auditing React");
        Command.cdIf(config);
        if (args.fix) {
            Command.execChild("sudo npm audit fix --force");
        } else {
            Command.execChild("npm audit");
        }
        break;
    
    case "flutter":
        Output.subtitle("Doctoring Flutter");
        Command.cdIf(config);
        if (!args.rest) {
            Command.execChild("flutter doctor -v");
        } else {
            Command.execChild(`flutter doctor ${args.rest}`);
        }
        break;
    
    default:
        Output.error("The type is invalid");
        return;
    }

    Output.done();
};



// The public API
module.exports = run;
