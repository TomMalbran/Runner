const Output  = require("../utils/output");
const Command = require("../utils/command");
const Config  = require("../utils/config");



/**
 * Runs the Build script
 * @param {Object} config
 * @param {Object} args
 * @returns {Void}
 */
function run(config, args) {
    Output.title("Builds the System");

    // Run the Command
    switch (config.type) {
    case "react": {
        Output.subtitle("Building React");
        const env = Config.getReactEnv(args);
        Command.cdIf(config);
        Command.exec(`${env}npm run build`);
        break;
    }
    
    case "node": {
        Output.subtitle("Building Node");
        Command.cdIf(config);
        Command.exec("npm run build");
        break;
    }
    
    case "flutter": {
        Output.subtitle("Building Flutter");
        const file = Config.getFlutterFile(args);
        Command.exec(`flutter build ios -t lib/main/${file}.dart`);
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
