const Output = require("../utils/output");
const FS     = require("fs");
const Shell  = require("shelljs");
const Child  = require("child_process");
const Fetch  = require("node-fetch");



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
 * @returns {String}
 */
function execSilent(command) {
    return Shell.exec(command, { silent : true }).stdout;
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
 * Executes a Wait Command
 * @returns {Void}
 */
function wait() {
    Child.exec("sleep 5");
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
 * Pushes a directory
 * @param {String} dir
 * @returns {Void}
 */
function pushd(dir) {
    Shell.pushd("-q", dir);
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
 * Pops a directory
 * @returns {Void}
 */
function popd() {
    Shell.popd("-q");
}

/**
 * Pops a directory, if required
 * @param {Object} config
 * @returns {Void}
 */
function popdIf(config) {
    if (config.path) {
        Shell.popd("-q");
    }
}

/**
 * List the Files
 * @param {String}  options The options or the source.
 * @param {String=} source The options or the source.
 * @returns {Array}
 */
function files(options, source) {
    if (source) {
        return Shell.ls(options, source);
    }
    return Shell.ls(options);
}

/**
 * Create the directory if it doesnt exists
 * @param {String} dir
 * @returns {Void}
 */
function mkdir(dir) {
    Shell.mkdir("-p", dir);
}

/**
 * Moves a File
 * @param {String}  source The options or the source.
 * @param {String=} dest   The dest if options specified.
 * @returns {Void}
 */
function move(source, dest) {
    Shell.mv("-f", source, dest);
}

/**
 * Copies the Files
 * @param {String}  options The options or the source.
 * @param {String}  source  The source if options specified, dest if not.
 * @param {String=} dest    The dest if options specified.
 * @returns {Void}
 */
function copy(options, source, dest) {
    Shell.cp(options, source, dest);
}

/**
 * Removes the Files
 * @param {String}  options The options or the source.
 * @param {String=} source  The source if options specified.
 * @returns {Void}
 */
function remove(options, source) {
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
    execSilent(`sed -i '' 's/${text}/${replace}/g' ${source}`);
}

/**
 * Uploads the Files through FTP
 * @param {Object} config
 * @param {String} flags
 * @param {String} from
 * @param {String} to
 * @returns {Void}
 */
function ftp(config, flags, from, to) {
    if (to[to.length - 1] === "/") {
        to = to.slice(0, -1);
    }
    execChild(`lftp -e "set ftp:ssl-allow ${config.useSSL ? "yes" : "no"}; mirror -R ${flags} ${from} ${to}; quit" -u ${config.user},${config.pass} ${config.host}`);
}

/**
 * Fetches from an Url
 * @param {String} url
 * @param {String} method
 * @param {Object} params
 * @returns {Promise}
 */
async function fetch(url, method, params) {
    const body     = new URLSearchParams(params);
    // @ts-ignore
    const result   = await Fetch(url, { method, body });
    const response = await result.text();
    return response;
}



// The public API
module.exports = {
    exec,
    execSilent,
    execChild,
    wait,
    exists,
    cd,
    cdIf,
    pushd,
    pushdIf,
    popd,
    popdIf,
    files,
    mkdir,
    move,
    copy,
    remove,
    replace,
    ftp,
    fetch,
};
