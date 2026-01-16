const Output = require("../utils/output");
const FS     = require("fs");
const Shell  = require("shelljs");
const Child  = require("child_process");
const Fetch  = require("node-fetch");



/**
 * Executes a Command
 * @param {string} command
 * @returns {void}
 */
function exec(command) {
    Shell.exec(command);
}

/**
 * Executes a Silent Command
 * @param {string} command
 * @returns {string}
 */
function execSilent(command) {
    const result = Shell.exec(command, { silent : true });
    return result.stdout + "\n\n\n" + result.stderr;
}

/**
 * Executes a Child Command
 * @param {string} command
 * @returns {void}
 */
function execChild(command) {
    Child.execSync(command, { stdio : "inherit" });
}

/**
 * Executes a Wait Command
 * @param {number=} seconds
 * @returns {void}
 */
function wait(seconds = 5) {
    Child.exec(`sleep ${seconds}`);
}

/**
 * Searches for the command
 * @param {string} command
 * @returns {boolean}
 */
function exists(command) {
    return Boolean(Shell.which(command));
}

/**
 * Changes the directory
 * @param {string} dir
 * @returns {void}
 */
function cd(dir) {
    Shell.cd(dir);
}

/**
 * Changes the directory, if required
 * @param {{path:string}} config
 * @returns {void}
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
 * @param {string} dir
 * @returns {void}
 */
function pushd(dir) {
    Shell.pushd("-q", dir);
}

/**
 * Pushes a directory, if required
 * @param {{path:string}} config
 * @returns {void}
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
 * @returns {void}
 */
function popd() {
    Shell.popd("-q");
}

/**
 * Pops a directory, if required
 * @param {{path:string}} config
 * @returns {void}
 */
function popdIf(config) {
    if (config.path) {
        Shell.popd("-q");
    }
}

/**
 * List the Files
 * @param {string}  options The options or the source.
 * @param {string=} source The options or the source.
 * @returns {Array}
 */
function files(options, source) {
    if (source) {
        return Shell.ls(options, source);
    }
    return Shell.ls(options);
}

/**
 * Create the directory if it doesn't exists
 * @param {string} dir
 * @returns {void}
 */
function mkdir(dir) {
    Shell.mkdir("-p", dir);
}

/**
 * Moves a File
 * @param {string} source
 * @param {string} dest
 * @returns {void}
 */
function move(source, dest) {
    Shell.mv("-f", source, dest);
}

/**
 * Copies the Files
 * @param {string} options
 * @param {string} source
 * @param {string} dest
 * @returns {void}
 */
function copy(options, source, dest) {
    Shell.cp(options, source, dest);
}

/**
 * Removes the Files
 * @param {string} options
 * @param {string} source
 * @returns {void}
 */
function remove(options, source) {
    Shell.rm(options, source);
}

/**
 * Syncs the Files
 * @param {string}    options
 * @param {string}    source
 * @param {string}    dest
 * @param {...string} exclude
 * @returns {void}
 */
function sync(options, source, dest, ...exclude) {
    const excludes = exclude.map((file) => `--exclude ${file}`).join(" ");
    Shell.exec(`rsync ${options} ${source} ${dest} ${excludes}`);
}

/**
 * Replaces the text with the given value in the given file
 * @param {string} text
 * @param {string} replace
 * @param {string} source
 * @returns {void}
 */
function replace(text, replace, source) {
    execSilent(`sed -i '' 's/${text}/${replace}/g' ${source}`);
}

/**
 * Uploads the Files through FTP
 * @param {{useSSL:boolean, user:string, pass:string, host:string}} config
 * @param {string} flags
 * @param {string} from
 * @param {string} to
 * @returns {void}
 */
function ftp(config, flags, from, to) {
    if (to[to.length - 1] === "/") {
        to = to.slice(0, -1);
    }
    execChild(`lftp -e "set ftp:ssl-allow ${config.useSSL ? "yes" : "no"}; mirror -R ${flags} ${from} ${to}; quit" -u ${config.user},${config.pass} ${config.host}`);
}

/**
 * Uploads a File through FTP
 * @param {{useSSL:boolean, user:string, pass:string, host:string}} config
 * @param {string} file
 * @param {string} to
 * @returns {void}
 */
function ftpFile(config, file, to) {
    if (to.length > 1 && to[to.length - 1] === "/") {
        to = to.slice(0, -1);
    }
    execChild(`lftp -e "set ftp:ssl-allow ${config.useSSL ? "yes" : "no"}; put -a -O ${to} ${file}; quit" -u ${config.user},${config.pass} ${config.host}`);
}

/**
 * Fetches from an Url
 * @param {string} url
 * @param {string} method
 * @param {object} params
 * @returns {Promise<string>}
 */
async function fetch(url, method, params) {
    const body     = new URLSearchParams(params);
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
    sync,
    replace,
    ftp,
    ftpFile,
    fetch,
};
