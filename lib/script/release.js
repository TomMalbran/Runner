const Input   = require("../utils/input");
const Command = require("../utils/command");
const Output  = require("../utils/output");

const FS      = require("fs");
const Path    = require("path");



/**
 * Runs the Release script, which is what puts a version of a Library out
 * @param {object} config
 * @param {object} args
 * @returns {Promise}
 */
async function run(config, args) {
    const currentDir = process.cwd();

    // A release that is half done is worse than none, so nothing is written
    // until everything it depends on is there
    if (!hasGit(currentDir)) {
        Output.exit("The library is not a git repository");
    }
    if (!isClean(currentDir)) {
        Output.exit("There are uncommitted changes");
    }
    if (!config.version) {
        Output.exit("The runner config has no version");
    }

    const oldVersion = String(config.version);
    const command    = await Input.valueOrChoice(args.command, "command", [ "minor", "patch", "major" ]);
    const newVersion = moveVersion(oldVersion, command);

    if (!newVersion) {
        Output.exit(`The version can not be moved from ${oldVersion}`);
    }

    const tag = `v${newVersion}`;
    if (hasTag(currentDir, tag)) {
        Output.exit(`The tag ${tag} is already there`);
    }
    if (!runChecks(currentDir)) {
        Output.exit("The checks did not pass");
    }

    // Everything is in place, so the version can be moved. The version script is
    // what writes it everywhere the changes of its config name, the way a deploy
    // asks it for a build rather than counting one of its own
    Output.line();
    const said    = Command.execSilent(`runner version ${command} --silent`);
    const written = readVersion(currentDir);

    // The version script stops on its own terms, so what it left behind is what
    // says whether it did the work, and what it said is why it did not
    if (written !== newVersion) {
        if (said.trim() !== "") {
            Output.error(said.trim());
        }
        Output.exit(`The version was left at ${written}, and not moved to ${newVersion}`);
    }
    Output.tab(command, `${oldVersion} -> ${newVersion}`);

    if (!commit(currentDir, newVersion, tag)) {
        Output.exit("The commit could not be made");
    }
    Output.tab("commit", `Version ${newVersion}`);
    Output.tab("tag", tag);

    // Nothing leaves the repository unless it is asked for
    if (args.push && await Input.confirm(`Push the release of ${newVersion}?`)) {
        Command.exec(`git -C ${currentDir} push && git -C ${currentDir} push origin ${tag}`);
        Output.tab("push", tag);
    } else {
        Output.text(`Push it with: git push && git push origin ${tag}`);
    }
    return true;
}



/**
 * Returns the Version the given one moves to, or empty when it can not move
 * @param {string} version
 * @param {string} command
 * @returns {string}
 */
function moveVersion(version, command) {
    const parts = version.split(".");
    if (parts.length !== 3 || parts.some((part) => !/^\d+$/.test(part))) {
        return "";
    }

    const numbers = parts.map(Number);
    switch (command) {
    case "major":
        return `${numbers[0] + 1}.0.0`;
    case "minor":
        return `${numbers[0]}.${numbers[1] + 1}.0`;
    case "patch":
        return `${numbers[0]}.${numbers[1]}.${numbers[2] + 1}`;
    default:
        return "";
    }
}

/**
 * Returns the Version the runner file holds, which the version script just wrote
 * @param {string} currentDir
 * @returns {string}
 */
function readVersion(currentDir) {
    try {
        const path = Path.join(currentDir, "runner.json");
        return String(JSON.parse(FS.readFileSync(path).toString()).version || "");
    } catch (e) {
        return "";
    }
}

/**
 * Runs the checks of the Library, when it has any
 * @param {string} currentDir
 * @returns {boolean}
 */
function runChecks(currentDir) {
    const packagePath = Path.join(currentDir, "package.json");
    if (!FS.existsSync(packagePath)) {
        return true;
    }

    const packageData = JSON.parse(FS.readFileSync(packagePath).toString());
    const scripts     = packageData.scripts || {};
    if (!scripts.lint) {
        return true;
    }

    // A check that can not run is not a check that passed
    if (!FS.existsSync(Path.join(currentDir, "node_modules"))) {
        Output.error("The dependencies are not installed, so the lint can not run");
        return false;
    }

    Output.subtitle("Running the lint");
    return Command.execCode("npm run lint") === 0;
}

/**
 * Commits and tags the Version
 * @param {string} currentDir
 * @param {string} version
 * @param {string} tag
 * @returns {boolean}
 */
function commit(currentDir, version, tag) {
    if (Command.execCode(`git -C ${currentDir} commit -a -m "Version ${version}"`) !== 0) {
        return false;
    }
    return Command.execCode(`git -C ${currentDir} tag ${tag}`) === 0;
}



/**
 * Returns true if the given directory is a git repository
 * @param {string} currentDir
 * @returns {boolean}
 */
function hasGit(currentDir) {
    return Command.execCode(`git -C ${currentDir} rev-parse --git-dir`) === 0;
}

/**
 * Returns true if the repository has nothing uncommitted
 * @param {string} currentDir
 * @returns {boolean}
 */
function isClean(currentDir) {
    return Command.execSilent(`git -C ${currentDir} status --porcelain`).trim() === "";
}

/**
 * Returns true if the repository already has the given Tag
 * @param {string} currentDir
 * @param {string} tag
 * @returns {boolean}
 */
function hasTag(currentDir, tag) {
    return Command.execCode(`git -C ${currentDir} rev-parse -q --verify refs/tags/${tag}`) === 0;
}



// The public API
module.exports = run;
