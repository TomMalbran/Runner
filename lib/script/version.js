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

    const type   = await Input.valueOrPrompt(args.type, "type");
    const parts  = config.version.split(".");

    const amount = args.undo ? -1 : 1;
    const obuild = config.build;
    let   nbuild = config.build;

    switch (type) {
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
    const ov       = `${oversion}-${obuild}`;
    const nv       = `${nversion}-${nbuild}`;
    
    Output.bold(`${type.toLocaleUpperCase()}: ${ov} -> ${nv}`);

    // Update the Runner
    const currentPath = process.cwd();
    const configFile  = FS.readFileSync(`${currentPath}/runner.json`);
    const configData  = JSON.parse(configFile.toString());
    configData.version = nversion;
    configData.build   = nbuild;
    FS.writeFileSync(`${currentPath}/runner.json`, JSON.stringify(configData, null, 4));

    // Save the New Version
    if (config.version.length) {
        for (const vconf of config.version) {
            save(vconf, ov, nv);
        }
    } else {
        save(config.version, ov, nv);
    }

    Output.done();
}

/**
 * Saves the new Version
 * @param {Object} conf
 * @param {String} ov
 * @param {String} nv
 */
function save(conf, ov, nv) {
    switch (conf.type) {
    case "env":
        Command.replace(ov, nv, `${conf.path}/.env`);
        break;
    case "node":
        Command.replace(ov, nv, `${conf.path}/package.json`);
        Command.replace(ov, nv, `${conf.path}/package-lock.json`);
        break;
    }
}


// The public API
module.exports = run;
