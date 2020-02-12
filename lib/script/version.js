const Input   = require("../utils/input");
const Output  = require("../utils/output");
const Command = require("../utils/command");
const FS      = require("fs");



/**
 * Runs the Version script
 * @param {Object} config
 * @param {Object} args
 * @returns {Promise}
 */
async function run(config, args) {
    Output.title("Updates the Version");
    Output.line();

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
        break;
    case "minor":
        parts[1] = Number(parts[1]) + amount;
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

    // Update the Runner
    const currentPath = process.cwd();
    const configFile  = FS.readFileSync(`${currentPath}/runner.json`);
    const configData  = JSON.parse(configFile.toString());
    configData.version = nversion;
    configData.build   = nbuild;
    FS.writeFileSync(`${currentPath}/runner.json`, JSON.stringify(configData, null, 4));

    // Save the New Version
    if (config.data.length) {
        for (const vconfig of config.data) {
            save(vconfig, oversion, nversion, obuild, nbuild);
        }
    } else {
        save(config.version, oversion, nversion, obuild, nbuild);
    }

    Output.done();
}

/**
 * Saves the new Version
 * @param {Object} config
 * @param {String} oversion
 * @param {String} nversion
 * @param {String} obuild
 * @param {String} nbuild
 * @returns {Void}
 */
function save(config, oversion, nversion, obuild, nbuild) {
    const ov  = `${oversion}-${obuild}`;
    const nv  = `${nversion}-${nbuild}`;
    const ovp = `${oversion}+${obuild}`;
    const nvp = `${nversion}+${nbuild}`;

    switch (config.type) {
    case "env":
        Command.replace(ov, nv, `${config.path}/.env`);
        break;
    case "node":
        Command.replace(ov, nv, `${config.path}/package.json`);
        Command.replace(ov, nv, `${config.path}/package-lock.json`);
        break;
    case "flutter":
        Command.replace(ov,  nv,  `${config.path}/lib/data/AppConfig.dart`);
        Command.replace(ovp, nvp, `${config.path}/pubspec.yaml`);
        Command.pushd(`${config.path}/ios`);
        Command.exec(`agvtool new-marketing-version ${nversion} > /dev/null`);
        Command.exec(`agvtool new-version -all ${nbuild} > /dev/null`);
        Command.popd(`${config.path}/ios`);
        break;
    }
}



// The public API
module.exports = run;
