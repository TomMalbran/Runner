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
 * Executes a Silent Command
 * @param {String} command
 * @returns {Void}
 */
function execSilent(command) {
    Shell.exec(command, { silent : true });
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
 * Changes the directory, if required
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
 * Pushes a directory, if required
 * @param {Object} config
 * @returns {Void}
 */
function pushdIf(config) {
    if (config.path) {
        if (!FS.existsSync(config.path)) {
            Output.exit("The path doesn't exists");
        } else {
            Shell.pushd("-q", config.path);
        }
    }
}

/**
 * Pops a directory, if required
 * @param {Object} config
 * @returns {Void}
 */
function popdIf(config) {
    if (config.path) {
        if (!FS.existsSync(config.path)) {
            Output.exit("The path doesn't exists");
        } else {
            Shell.popd("-q");
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

/**
 * Replaces the text with the given value in the given file
 * @param {String} text
 * @param {String} replace
 * @param {String} source
 * @returns {Void}
 */
function replace(text, replace, source) {
    Shell.sed("-i.bck", `s/${text}/${replace}/g`, source);
    Shell.rm(`${source}.bck`);
}



// The public API
module.exports = {
    exec,
    execSilent,
    execChild,
    exists,
    cd,
    cdIf,
    pushdIf,
    popdIf,
    cp,
    rm,
    replace,
};
