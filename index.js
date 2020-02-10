#!/usr/bin/env node

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

    const scriptName = process.argv[2];
    if (!scriptName) {
        Output.exit("You must provide a script name");
    }

    const scriptPath = Path.join(__dirname, "lib", "script", scriptName);
    const scriptFile = FS.readFileSync(Path.join(__dirname, "scripts.json"));
    const scriptData = JSON.parse(scriptFile.toString());

    if (scriptData && scriptData[scriptName]) {
        let configData = {};
        try {
            const configFile = FS.readFileSync(`${currentPath}/runner.json`);
            configData = JSON.parse(configFile.toString());
        } catch (e) {
            Output.exit("The runner JSON is invalid");
        }

        const configScript = configData[scriptName];
        const params       = process.argv.slice(3);

        const [ config, args ] = await Config.parse(scriptData[scriptName], configScript, params);
        require(scriptPath)(config, args);
    }
}

main();
