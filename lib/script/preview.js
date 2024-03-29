const Output  = require("../utils/output");
const Command = require("../utils/command");
const Config  = require("../utils/config");



/**
 * Runs the Preview script
 * @param {Object} config
 * @param {Object} args
 * @param {Object} env
 * @returns {Boolean}
 */
function run(config, args, env) {
    // Start the Apache server
    if (config.apache && process.platform === "linux") {
        Command.exec("sudo /etc/init.d/apache2 stop");
        Command.exec("sudo /opt/lampp/xampp start");
    }

    // Run the Command
    switch (config.type) {
    case "react":
        Output.subtitle("Previewing React");
        Command.cdIf(config);
        Command.exec("serve -s build");
        break;

    case "node":
        Output.subtitle("Previewing Node");
        Command.cdIf(config);
        Command.exec("serve -s build");
        break;

    case "flutter": {
        Output.subtitle("Previewing Flutter");
        const file = Config.getFlutterFile(env);
        Command.cdIf(config);
        Command.exec("open -a Simulator");
        Command.exec(`flutter run -t lib/main/${file}.dart  --release -d "7c882bdf9390c383aab968d33445c46725cd04ec"`);
        break;
    }

    case "apache":
        Output.subtitle("Starting Apache");
        if (process.platform === "linux") {
            Command.exec(`google-chrome -s ${config.url} 2>/dev/null`);
        } else {
            Command.exec(`open -a "Google Chrome" ${config.url}`);
        }
        break;

    default:
        Output.exit("The type is invalid");
    }

    return false;
};



// The public API
module.exports = run;
