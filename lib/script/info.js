const Output = require("../utils/output");



/**
 * Runs the Info script
 * @param {Object} config
 * @returns {Boolean}
 */
function run(config) {
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

    return true;
}



// The public API
module.exports = run;
