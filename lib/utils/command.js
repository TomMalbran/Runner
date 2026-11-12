const Output = require("../utils/output");
const FS     = require("fs");
const OS     = require("os");
const Path   = require("path");
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
 * Executes a Silent Command and returns its exit code
 * @param {string} command
 * @returns {number}
 */
function execCode(command) {
    return Shell.exec(command, { silent : true }).code;
}

/**
 * Executes a Child Command
 * @param {string} command
 * @param {object=} env
 * @returns {void}
 */
function execChild(command, env = {}) {
    Child.execSync(command, { stdio : "inherit", env : { ...process.env, ...env } });
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
 * Returns the command that logs in through SSH and the environment it needs
 * @param {{user:string, pass:string, host:string}} config
 * @returns {{login:string, env:object}}
 */
function sshLogin(config) {
    // The password is given to sshpass in the environment, so it is not in the
    // command, and it is only asked when there is no key to log in with
    let login = `ssh ${config.user}@${config.host}`;
    let env   = {};
    if (config.pass && exists("sshpass")) {
        login = `sshpass -e ${login}`;
        env   = { SSHPASS : config.pass };
    }
    return { login, env };
}

/**
 * Uploads a Directory through SSH as a single compressed Archive
 * @param {{user:string, pass:string, host:string}} config
 * @param {boolean} replace
 * @param {string}  from
 * @param {string}  to
 * @param {boolean} rootOnly
 * @returns {void}
 */
function ssh(config, replace, from, to, rootOnly = false) {
    // The SSH session starts in the home, which is the root of the FTP paths
    const dir = to.replace(/^\/+/, "").replace(/\/+$/, "");

    // A Mirror that deletes is done by extracting next to the old Directory and swapping
    // them, so the removed files are gone and a failed upload keeps the old copy
    let remote = `mkdir -p ${dir} && tar -xzf - -C ${dir}`;
    if (replace) {
        remote = [
            `rm -rf ${dir}.new ${dir}.old`,
            `mkdir -p ${dir}.new`,
            `tar -xzf - -C ${dir}.new`,
            `if [ -d ${dir} ]; then mv ${dir} ${dir}.old; fi`,
            `mv ${dir}.new ${dir}`,
            `rm -rf ${dir}.old`,
        ].join(" && ");
    }

    // The macOS tar adds the extended attributes, the file flags and the AppleDouble
    // files, which the GNU tar of the server warns about or extracts as files. The
    // links are followed, as a worktree links to folders of the main checkout that
    // would reach the server as a path of this machine. The Archive is made first,
    // so its size is known and the progress can be shown. With rootOnly it takes the
    // files of the Directory and none of its folders, like a mirror without recursion
    const startTime = Date.now();
    const archive   = Path.join(OS.tmpdir(), `runner-${startTime}.tgz`);
    const progress  = Path.join(__dirname, "progress.js");
    let   contents  = ".";
    if (rootOnly) {
        const names = FS.readdirSync(from).filter((name) => !FS.statSync(Path.join(from, name)).isDirectory());
        contents = names.map((name) => `"./${name}"`).join(" ");
    }
    try {
        execChild(`COPYFILE_DISABLE=1 tar --no-xattrs --no-mac-metadata --no-fflags -h -czf ${archive} -C ${from} ${contents}`);
        const { login, env } = sshLogin(config);
        execChild(`"${process.execPath}" "${progress}" ${archive} | ${login} "${remote}"`, env);

        // The time counts until the server extracted the Archive, not only until it was sent
        const seconds = Math.round((Date.now() - startTime) / 1000);
        Output.tab("upload time", `${seconds} s`);
    } finally {
        FS.rmSync(archive, { force : true });
    }
}

/**
 * Uploads a File through SSH
 * @param {{user:string, pass:string, host:string}} config
 * @param {string} file
 * @param {string} to
 * @returns {void}
 */
function sshFile(config, file, to) {
    // The SSH session starts in the home, which is the root of the FTP paths
    const dir    = to.replace(/^\/+/, "").replace(/\/+$/, "");
    const dest   = dir ? `${dir}/${Path.basename(file)}` : Path.basename(file);
    const remote = dir ? `mkdir -p ${dir} && cat > ${dest}` : `cat > ${dest}`;

    const { login, env } = sshLogin(config);
    execChild(`${login} "${remote}" < ${file}`, env);
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
    execCode,
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
    ssh,
    sshFile,
    fetch,
};
