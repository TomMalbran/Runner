const Output = require("../utils/output");
const FS     = require("fs");
const Shell  = require("shelljs");
const Child  = require("child_process");



/**
 * Executes a Command
 * @param {String} command
 * @returns {Void}
 */
function exec(command) {
    Shell.exec(command);
}

/**
 * Executes a Child Command
 * @param {String} command
 * @returns {Void}
 */
function execChild(command) {
    Child.execSync(command, { stdio : "inherit" });
}

/**
 * Searches for the command
 * @param {String} command
 * @returns {Boolean}
 */
function exists(command) {
    return Boolean(Shell.which(command));
}

/**
 * Changes the directory
 * @param {String} dir
 * @returns {Void}
 */
function cd(dir) {
    Shell.cd(dir);
}

/**
 * Changes the directory if required
 * @param {Object} config
 * @returns {Void}
 */
function cdIf(config) {
    if (config.path) {
        if (!FS.existsSync(config.path)) {
            Output.exit("The path doesn't exists");
        } else {
            Shell.cd(config.path);
        }
    }
}

/**
 * Copies the Files
 * @param {String} options
 * @param {String} source
 * @param {String} dest
 * @returns {Void}
 */
function cp(options, source, dest) {
    Shell.cp(options, source, dest);
}

/**
 * Removes the Files
 * @param {String} options
 * @param {String} source
 * @returns {Void}
 */
function rm(options, source) {
    Shell.rm(options, source);
}



// The public API
module.exports = {
    exec,
    execChild,
    exists,
    cd,
    cdIf,
    cp,
    rm,
};
