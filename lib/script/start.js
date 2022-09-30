const Output  = require("../utils/output");
const Command = require("../utils/command");
const Config  = require("../utils/config");



/**
 * Runs the Start script
 * @param {Object} config
 * @param {Object} args
 * @param {Object} env
 * @returns {Boolean}
 */
function run(config, args, env) {
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
        const file = Config.getFlutterFile(env);
        Output.info(file);
        startApache(config);
        Command.cdIf(config);
        if (args.web) {
            Command.execChild(`flutter run -t lib/main/${file}Web.dart -d chrome`);
        } else {
            const device = args.device ? args.device.replace(/-/g, " ") : "iPhone 14";
            Command.exec("open -a Simulator");
            Command.execChild(`flutter run -t lib/main/${file}.dart -d "${device}"`);
        }
        break;
    }

    case "cordova": {
        startApache(config);
        Command.cdIf(config);
        const device = args.device || "iPhone-14";
        Command.execChild(`cordova emulate ios --target="${device}, 16.0"`);
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

    case "server":
        Output.subtitle("Starting a Node Server");
        Command.cdIf(config);
        Command.execChild(`http-server -c-1 -p ${config.port}`);
        break;

    case "simulator":
        Output.subtitle("Starting the iOS Simulator");
        Command.exec("open -a Simulator");
        break;

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
