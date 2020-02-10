const Command = require("../utils/command");
const Output  = require("../utils/output");



/**
 * Runs the Build script
 * @param {Object} config
 * @param {Object} args
 * @returns {Promise}
 */
async function run(config, args) {
    Output.title("Builds the System");

    // Run the Command
    switch (config.type) {
    case "react":
        Output.subtitle("Building React");
        Command.cdIf(config);
        if (args.stage) {
            Command.exec("env-cmd -f .env.stage npm run build");
        } else {
            Command.exec("npm run build");
        }
        break;
    
    case "node":
        Output.subtitle("Building Node");
        Command.cdIf(config);
        Command.exec("npm run build");
        break;
    
    case "flutter":
        Output.subtitle("Building Flutter");
        if (args.stage) {
            Command.exec("flutter build ios -t lib/main/Stage.dart");
        } else {
            Command.exec("flutter build ios -t lib/main/Prod.dart");
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
