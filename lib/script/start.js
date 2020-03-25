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
    Output.title("Starting the System");

    // Run the Command
    switch (config.type) {
    case "react":
        Output.subtitle("Starting React");
        startApache(config);
        Command.cdIf(config);
        Command.execChild("npm run start");
        break;
    
    case "node":
        Output.subtitle("Starting Node");
        startApache(config);
        Command.cdIf(config);
        Command.execChild("npm run start");
        break;
    
    case "flutter": {
        Output.subtitle("Starting Flutter");
        const file   = Config.getFlutterFile(args);
        const device = args.device ? args.device.replace(/-/g, " ") : "iPhone 11 Pro";
        startApache(config);
        Command.cdIf(config);
        Command.exec("open -a Simulator");
        Command.exec("flutter clean");
        Command.execChild(`flutter run -t lib/main/${file}.dart -d "${device}"`);
        break;
    }

    case "cordova": {
        startApache(config);
        Command.cdIf(config);
        const device = args.device || "iPhone-11-Pro";
        Command.execChild(`cordova emulate ios --target="${device}, 13.2"`);
        break;
    }
    
    case "apache":
        Output.subtitle("Starting Apache");
        if (!config.url) {
            Output.exit("The url is required");
        }
        if (process.platform === "linux") {
            startApache(config);
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

/**
 * Start the Apache server
 * @param {Object} config
 * @returns {Void}
 */
function startApache(config) {
    if (config.apache && process.platform === "linux") {
        Command.exec("sudo /etc/init.d/apache2 stop");
        Command.exec("sudo /opt/lampp/xampp start");
    }
}



// The public API
module.exports = run;
