const Output  = require("../utils/output");
const Command = require("../utils/command");
const Config  = require("../utils/config");



/**
 * Runs the Start script
 * @param {Object} config
 * @param {Object} args
 * @returns {Boolean}
 */
function run(config, args) {
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
    
    case "apache": {
        Output.subtitle("Starting Apache");
        const url = Config.getUrl(config);

        if (process.platform === "linux") {
            startApache(config);
            Command.exec(`google-chrome -s ${url} 2>/dev/null`);
        } else {
            Command.exec(`open -a "Google Chrome" ${url}`);
        }

        if (args.reload && Command.exists("ag") && Command.exists("entr")) {
            Output.subtitle("Watching Files");
            if (process.platform === "linux") {
                Command.exec("ag --js -l | entr xdotool search --onlyvisible --class \"google-chrome\" windowfocus key --window %@ 'ctrl+r'");
            } else {
                Command.exec(`ag --js -l | entr osascript -e 'tell application "Google Chrome" to reload (tabs of window 1 whose URL contains "${url}")'`);
            }
        }
        break;
    }
    
    default:
        Output.exit("The type is invalid");
    }

    return false;
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
