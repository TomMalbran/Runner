const Output = require("../utils/output");
const Shell  = require("shelljs");



/**
 * Runs the Audit script
 * @param {Object} config
 * @param {Object} args
 * @returns {Promise}
 */
async function run(config, args) {
    Output.title("Audits the System");

    // Run the Command
    switch (config.type) {
    case "react":
        Output.subtitle("Auditing React");
        Shell.cd(config.path);
        if (args.force) {
            Shell.exec("sudo npm audit fix --force");
        } else {
            Shell.exec("npm audit");
        }
        break;
    
    case "flutter":
        Output.subtitle("Doctoring Flutter");
        Shell.cd(config.path);
        if (!args.rest) {
            Shell.exec("flutter doctor -v");
        } else {
            Shell.exec(`flutter doctor ${args.rest}`);
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
