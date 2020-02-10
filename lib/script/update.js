const Output = require("../utils/output");
const Shell  = require("shelljs");



/**
 * Runs the Update script
 * @param {Object} config
 * @param {Object} args
 * @returns {Promise}
 */
async function run(config, args) {
    Output.title("Updates the System");

    // Run the Command
    switch (config.type) {
    case "react":
        Output.subtitle("Updating React");
        Shell.cd(config.path);
        Shell.exec("npm update");
        break;
    
    case "node":
        Output.subtitle("Updating Node");
        Shell.cd(config.path);
        Shell.exec("npm update");
        break;
    
    case "flutter":
        Output.subtitle("Updating Flutter");
        Shell.cd(config.path);
        Shell.exec("flutter upgrade");
        break;
    
    case "composer":
        Output.subtitle("Updating Composer");
        Shell.cd(config.path);
        Shell.exec("composer update");
        break;
    
    default:
        Output.error("The type is invalid");
        return;
    }

    Output.done();
};



// The public API
module.exports = run;
