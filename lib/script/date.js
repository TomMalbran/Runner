const Input  = require("../utils/input");
const Output = require("../utils/output");



/**
 * Runs the Date script
 * @param {Object} config
 * @param {Object} args
 * @returns {Promise}
 */
async function run(config, args) {
    Output.title("Returns the Date");
    const time = await Input.valueOrPrompt(args.time, "timestamp");
    const date = new Date(time * 1000);

    Output.bold("The given Date is");
    Output.text(date.toString());
    Output.done();
}



// The public API
module.exports = run;
