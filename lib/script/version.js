const Input   = require("../utils/input");
const Output  = require("../utils/output");
const Command = require("../utils/command");

const FS      = require("fs");
const Path    = require("path");



/**
 * Runs the Version script
 * @param {Object} config
 * @param {Object} args
 * @returns {Promise}
 */
async function run(config, args) {
    Output.title("Updates the Version");
    Output.line();

    let version = {};
    if (!config.parent) {
        version = await update(config, args);
    } else {
        version = await set(config, args);
    }
    
    // Save the New Version
    if (version.oversion !== version.nversion || version.obuild !== version.nbuild) {
        saveConfig(version);
        if (config.changes.length) {
            for (const change of config.changes) {
                saveChange(change, version);
            }
        } else {
            saveChange(config.changes, version);
        }
    }

    Output.done();
}

/**
 * Updates the Version
 * @param {Object} config
 * @returns {Promise}
 */
async function update(config, args) {
    if (!config.version || !config.build) {
        Output.exit("The version and build are required");
    }

    const command = await Input.valueOrPrompt(args.command, "command");
    const parts   = config.version.split(".");
    const amount  = args.undo ? -1 : 1;
    const obuild  = config.build;
    let   nbuild  = config.build;

    switch (command) {
    case "mayor":
        parts[0] = Number(parts[0]) + amount;
        parts[1] = 0;
        parts[2] = 0;
        break;
    case "minor":
        parts[1] = Number(parts[1]) + amount;
        parts[2] = 0;
        break;
    case "patch":
        parts[2] = Number(parts[2]) + amount;
        break;
    case "build":
        nbuild = Number(nbuild) + amount;
        break;
    default:
        Output.exit("Invalid type");
    }
    
    const oversion = config.version;
    const nversion = parts.join(".");
    Output.tab(command, `${oversion}-${obuild} -> ${nversion}-${nbuild}`);

    return { oversion, nversion, obuild, nbuild };
}

/**
 * Sets the Version
 * @param {Object} config
 * @returns {Object}
 */
function set(config, args) {
    const obuild = config.build;
    let   nbuild = config.build;

    if (args.command === "build") {
        nbuild = Number(nbuild) + 1;
    }

    const configPath = Path.resolve(process.cwd(), config.parent, "runner.json");
    const configFile = FS.readFileSync(configPath);
    const configData = JSON.parse(configFile.toString());
    const oversion   = config.version;
    const nversion   = configData.version;

    if (oversion !== nversion || obuild !== nbuild) {
        Output.tab(args.command || "set", `${oversion}-${obuild} -> ${nversion}-${nbuild}`);
    } else {
        Output.tab("version", `${nversion}-${nbuild}`);
    }

    return { oversion, nversion, obuild, nbuild };
}



/**
 * Saves the Version in the Config
 * @param {Object} version
 * @returns {Void}
 */
function saveConfig(version) {
    const configPath = Path.resolve(process.cwd(), "runner.json");
    const configFile = FS.readFileSync(configPath);
    const configData = JSON.parse(configFile.toString());

    configData.version = version.nversion;
    configData.build   = version.nbuild;
    FS.writeFileSync(configPath, JSON.stringify(configData, null, 4));
}

/**
 * Saves the Version in the Change
 * @param {Object} change
 * @param {Object} version
 * @returns {Void}
 */
function saveChange(change, version) {
    const ov  = `${version.oversion}-${version.obuild}`;
    const nv  = `${version.nversion}-${version.nbuild}`;
    const ovp = `${version.oversion}+${version.obuild}`;
    const nvp = `${version.nversion}+${version.nbuild}`;

    switch (change.type) {
    case "env":
        Command.replace(ov, nv, `${change.path}/.env`);
        break;
    case "node":
        Command.replace(ov, nv, `${change.path}/package.json`);
        Command.replace(ov, nv, `${change.path}/package-lock.json`);
        break;
    case "flutter":
        Command.replace(ov,  nv,  `${change.path}/lib/data/AppConfig.dart`);
        Command.replace(ovp, nvp, `${change.path}/pubspec.yaml`);
        Command.pushd(`${change.path}/ios`);
        Command.exec(`agvtool new-marketing-version ${version.nversion} > /dev/null`);
        Command.exec(`agvtool new-version -all ${version.nbuild} > /dev/null`);
        Command.popd(`${change.path}/ios`);
        break;
    }
}



// The public API
module.exports = run;
