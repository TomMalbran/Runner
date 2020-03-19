#!/usr/bin/env node

const Help   = require("./lib/script/help");
const Output = require("./lib/utils/output");
const Config = require("./lib/utils/config");

const FS     = require("fs");
const Path   = require("path");
const Clear  = require("clear");



/**
 * The Main Function
 * @returns {Promise}
 */
async function main() {
    Clear();
    Output.logo("Runner");

    const currentPath = process.cwd();
    const basePath    = Path.basename(currentPath);
    if (FS.existsSync(`${basePath}/runner.json`)) {
        Output.exit("You must have a runner.json file");
    }

    // Read the Scripts Data
    const scriptFile = FS.readFileSync(Path.join(__dirname, "scripts.json"));
    const scriptData = JSON.parse(scriptFile.toString());

    // Read the Config Data
    const configFile = FS.readFileSync(`${currentPath}/runner.json`);
    let   configData = {};
    try {
        configData = JSON.parse(configFile.toString());
    } catch (e) {
        Output.exit("The runner JSON is invalid");
    }

    const scriptName = process.argv[2];
    if (!scriptName) {
        Help(scriptData, configData);
        return;
    }

    if (!scriptData || !scriptData[scriptName]) {
        Output.exit(`The script "${scriptName}" does not exist`);
    }

    const params           = process.argv.slice(3);
    const [ config, args ] = await Config.parse(scriptName, scriptData, configData, params);
    const scriptPath       = Path.join(__dirname, "lib", "script", scriptName);
    require(scriptPath)(config, args);
}

main();
