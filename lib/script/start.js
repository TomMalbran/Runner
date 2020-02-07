const input  = require("../utils/input");
const output = require("../utils/output");
const shell  = require("shelljs");



/**
 * Runs the Start script
 * @param {Object} config
 * @param {Array}  params
 * @returns {Promise}
 */
async function run(config, params) {
    output.title("Starting any System");
    let system = params[0];

    if (!system) {
        system = await input.prompt("system");
    }
    const sysConfig = config[system];
    if (!sysConfig) {
        output.error("The system doesn't exists");
        return;
    }

    if (sysConfig.apache && process.platform === "linux") {
        shell.exec("sudo /etc/init.d/apache2 stop");
        shell.exec("sudo /opt/lampp/xampp start");
    }

    switch (sysConfig.type) {
    case "react":
        shell.cd(sysConfig.path);
        shell.exec("npm run start");
        break;
    
    case "fullter":
        shell.cd(sysConfig.path);
        shell.exec("open -a Simulator");
        shell.exec("flutter clean");
        shell.exec('flutter run -t lib/main/Local.dart -d "iPhone 11 Pro"');
        break;
    
    case "apache":
        if (process.platform === "linux") {
            shell.exec(`google-chrome -s ${sysConfig.url} 2>/dev/null`);
        } else {
            shell.exec(`open -a "Google Chrome" ${sysConfig.url}`);
        }
        break;
    
    default:
        output.error("The type is invalid");
    }
};



// The public API
module.exports = run;
