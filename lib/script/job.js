const Command = require("../utils/command");
const Output  = require("../utils/output");
const Config  = require("../utils/config");



/**
 * Runs the Job script
 * @param {Object} config
 * @returns {Promise}
 */
async function run(config) {
    Output.info(`Job: ${config.system}`);
    Output.line();

    const url = Config.getUrl(config);
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        Output.exit("The url must start with http:// or https://");
    }

    const params = {}
    if (config.token) {
        params.token = config.token;
    }

    const result = await Command.fetch(url, "POST", params);
    if (result) {
        Output.step("Output");
        Output.text(result);
    }

    return true;
}



// The public API
module.exports = run;
