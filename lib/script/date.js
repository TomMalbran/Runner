const input  = require("../utils/input");
const output = require("../utils/output");



/**
 * Runs the Date script
 * @param {Object} config
 * @param {Array}  params
 * @returns {Promise}
 */
async function run(config, params) {
    output.title("Returns the Date");
    let time = params[0];

    if (!time) {
        time = await input.prompt("date");
    }

    const date = new Date(time * 1000);
    output.bold("The given Date is");
    output.text(date.toDateString());
    output.done();
}



// The public API
module.exports = run;
