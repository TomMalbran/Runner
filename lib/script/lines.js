const Command = require("../utils/command");
const Output  = require("../utils/output");



/**
 * Runs the Lines script
 * @param {Object} config
 * @param {Object} args
 * @returns {Promise}
 */
async function run(config, args) {
    Output.subtitle("Counting the Lines of Code");
    Command.execChild('cloc --vcs=git --not-match-d="(misc|.vscode|.zed)" --not-match-f="(package-lock|composer.lock)" --fullpath .');
    return true;
}



// The public API
module.exports = run;
