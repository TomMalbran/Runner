const Command = require("../utils/command");
const Output  = require("../utils/output");



/**
 * Runs the Redis script
 * @param {Object} config
 * @param {Object} args
 * @returns {Promise}
 */
async function run(config, args) {
    const text    = Command.execSilent("redis-server --version");
    const number  = text.match(/v=(\d+\.\d+\.\d+)/);
    const version = number?.[1] ?? "";

    Output.subtitle(`Staring the Redis Server ${version}`);
    Command.exec("redis-server");
    return true;
}



// The public API
module.exports = run;
