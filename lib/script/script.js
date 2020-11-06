const Command = require("../utils/command");
const Output  = require("../utils/output");



/**
 * Runs the Script script
 * @param {Object} config
 * @param {Object} args
 * @returns {Promise}
 */
async function run(config, args) {
    if (config.title) {
        Output.subtitle(config.title);
    } else {
        Output.line();
    }

    if (!config.script) {
        Output.exit("The script is required");
    }
    Command.execChild(`${config.script} ${args.rest}`);

    return true;
}



// The public API
module.exports = run;
