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
    let   scriptName = process.argv[2];
    const params     = process.argv.slice(3);
    const silent     = params.includes("--silent");

    if (!silent) {
        Clear();
        Output.logo("Runner");
    }

    const currentPath = process.cwd();
    const basePath    = Path.basename(currentPath);
    if (!FS.existsSync(`${currentPath}/runner.json`)) {
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


    // Show some help
    if (!scriptName) {
        Help(scriptData, configData);
        return;
    }
    // Show the Version
    if (scriptName === "-v") {
        return Output.result(configData.version);
    }
    // Show the Version and Build
    if (scriptName === "-vb") {
        return Output.result(`${configData.version}-${configData.build}`);
    }
    // Show the Url
    if (scriptName === "-url") {
        return Output.result(configData.local);
    }


    // Try to get the correct script
    const configScripts = configData.scripts;
    if (!scriptData[scriptName]) {
        if (configScripts.script && configScripts.script[scriptName]) {
            params.unshift(scriptName);
            scriptName = "script";
        } else {
            Output.exit(`The script "${scriptName}" does not exist`);
        }
    } else if (scriptData[scriptName].reqConfig && !configData[scriptName] && configScripts.script && configScripts.script[scriptName]) {
        params.unshift(scriptName);
        scriptName = "script";
    }

    // Execute the Command
    Output.title(scriptData[scriptName].title, silent);
    const { config, args, env } = await Config.parse(scriptName, scriptData, configData, params);
    const scriptPath            = Path.join(__dirname, "lib", "script", scriptName);
    const response              = await require(scriptPath)(config, args, env);
    Output.done(!response || silent);
}

main();
