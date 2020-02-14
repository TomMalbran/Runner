const Output  = require("../utils/output");
const Command = require("../utils/command");
const Config  = require("../utils/config");



/**
 * Runs the Start script
 * @param {Object} config
 * @param {Object} args
 * @returns {Void}
 */
function run(config, args) {
    Output.title("Starts the System");

    // Start the Apache server
    if (config.apache && process.platform === "linux") {
        Command.exec("sudo /etc/init.d/apache2 stop");
        Command.exec("sudo /opt/lampp/xampp start");
    }

    // Run the Command
    switch (config.type) {
    case "react":
        Output.subtitle("Starting React");
        Command.cdIf(config);
        Command.execChild("npm run start");
        break;
    
    case "node":
        Output.subtitle("Starting Node");
        Command.cdIf(config);
        Command.execChild("npm run start");
        break;
    
    case "flutter": {
        Output.subtitle("Starting Flutter");
        const file = Config.getFlutterFile(args);
        Command.cdIf(config);
        Command.exec("open -a Simulator");
        Command.exec("flutter clean");
        Command.execChild(`flutter run -t lib/main/${file}.dart -d "iPhone 11 Pro"`);
        break;
    }
    
    case "apache":
        Output.subtitle("Starting Apache");
        if (process.platform === "linux") {
            Command.exec(`google-chrome -s ${config.url} 2>/dev/null`);
        } else {
            Command.exec(`open -a "Google Chrome" ${config.url}`);
        }
        if (args.reload && Command.exists("ag") && Command.exists("entr")) {
            Output.subtitle("Watching Files");
            Command.exec("ag --js -l | entr run reload silent");
        }
        break;
    
    default:
        Output.exit("The type is invalid");
    }
};



// The public API
module.exports = run;
