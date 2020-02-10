const Output = require("../utils/output");
const Shell  = require("shelljs");



/**
 * Runs the Start script
 * @param {Object} config
 * @param {Object} args
 * @returns {Promise}
 */
async function run(config, args) {
    Output.title("Starts the System");

    // Start the Apache server
    if (config.apache && process.platform === "linux") {
        Shell.exec("sudo /etc/init.d/apache2 stop");
        Shell.exec("sudo /opt/lampp/xampp start");
    }

    // Run the Command
    switch (config.type) {
    case "react":
        Output.subtitle("Starting React");
        Shell.cd(config.path);
        Shell.exec("npm run start");
        break;
    
    case "node":
        Output.subtitle("Starting Node");
        Shell.cd(config.path);
        Shell.exec("npm run start");
        break;
    
    case "flutter":
        Output.subtitle("Starting Flutter");
        Shell.cd(config.path);
        Shell.exec("open -a Simulator");
        Shell.exec("flutter clean");
        Shell.exec('flutter run -t lib/main/Local.dart -d "iPhone 11 Pro"');
        break;
    
    case "apache":
        Output.subtitle("Starting Apache");
        if (process.platform === "linux") {
            Shell.exec(`google-chrome -s ${config.url} 2>/dev/null`);
        } else {
            Shell.exec(`open -a "Google Chrome" ${config.url}`);
        }
        break;
    
    default:
        Output.exit("The type is invalid");
    }
};



// The public API
module.exports = run;
