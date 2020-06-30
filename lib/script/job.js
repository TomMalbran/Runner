const Command = require("../utils/command");
const Output  = require("../utils/output");



/**
 * Runs the Job script
 * @param {Object} config
 * @param {Object} args
 * @returns {Promise}
 */
async function run(config, args) {
    Output.title("Executing the Job");
    Output.line();

    if (!config.url) {
        Output.exit("The url is required");
    } else if (!config.token) {
        Output.exit("The token is required");
    }

    const result = await Command.fetch(config.url, "POST", {
        "token" : config.token,
    });
    if (result) {
        Output.step("Output");
        Output.text(result);
    }
    
    Output.done();
}



// The public API
module.exports = run;
