const Command = require("../utils/command");

const FS      = require("fs");
const Path    = require("path");

const BuildFile = "runner.build.json";



/**
 * Returns the main worktree directory, so all the worktrees share the same build.
 * Falls back to the current directory when it is not a git repository.
 * @returns {string}
 */
function getMainDir() {
    const result = Command.execSilent("git rev-parse --git-common-dir");
    const gitDir = result.split("\n")[0].trim();
    if (!gitDir) {
        return process.cwd();
    }
    const absolute = Path.resolve(process.cwd(), gitDir);
    return Path.dirname(absolute);
}

/**
 * Returns the path to the Build file in the main worktree
 * @returns {string}
 */
function getBuildPath() {
    return Path.join(getMainDir(), BuildFile);
}

/**
 * Returns true if the Build file is used, so a project without it works as before
 * @returns {boolean}
 */
function hasBuildFile() {
    return FS.existsSync(getBuildPath());
}

/**
 * Returns the Build from the Build file, or the given fallback when there is no file
 * @param {(number|string)} fallback
 * @returns {(number|string)}
 */
function readBuild(fallback) {
    const buildPath = getBuildPath();
    if (!FS.existsSync(buildPath)) {
        return fallback;
    }
    try {
        const data = JSON.parse(FS.readFileSync(buildPath).toString());
        return data.build;
    } catch (e) {
        return fallback;
    }
}

/**
 * Saves the Build in the Build file
 * @param {(number|string)} build
 * @returns {void}
 */
function writeBuild(build) {
    const buildPath = getBuildPath();
    FS.writeFileSync(buildPath, JSON.stringify({ build : Number(build) }, null, 4));
}




// The public API
module.exports = {
    getBuildPath,
    hasBuildFile,
    readBuild,
    writeBuild,
};
