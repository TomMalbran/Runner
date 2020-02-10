const Output = require("../utils/output");



/**
 * Runs the Info script
 * @param {Object} config
 * @param {Object} args
 * @returns {Void}
 */
function run(config, args) {
    Output.title("The current Info");
    Output.line();

    for (const [ key, value ] of Object.entries(config)) {
        Output.text(`${key.toLocaleUpperCase()}\t: ${value}`);
    }
    Output.done();
}



// The public API
module.exports = run;
