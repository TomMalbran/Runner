const output = require("../utils/output");



/**
 * Runs the Info script
 * @param {Object} config
 * @param {Array}  params
 * @returns {Void}
 */
function run(config, params) {
    output.title("The current Info");

    for (const [ key, value ] of Object.entries(config)) {
        output.text(`${key.toLocaleUpperCase()}\t: ${value}`);
    }
    output.done();
}



// The public API
module.exports = run;
