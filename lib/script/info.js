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

    let maxLength = 0;
    for (const key of Object.keys(config)) {
        if (key.length > maxLength) {
            maxLength = key.length;
        }
    }
    for (const [ key, value ] of Object.entries(config)) {
        Output.tab(key, value, maxLength);
    }
    Output.done();
}



// The public API
module.exports = run;
