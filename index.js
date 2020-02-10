#!/usr/bin/env node

const output = require("./lib/utils/output");

const fs     = require("fs");
const path   = require("path");

const clear  = require("clear");
const chalk  = require("chalk");
const figlet = require("figlet");



clear();

console.log(chalk.yellow(
    figlet.textSync("Runner", { horizontalLayout : "full" })
));

const currentPath = process.cwd();
const basePath    = path.basename(currentPath);
if (fs.existsSync(`${basePath}/runner.json`)) {
    output.exit("You must have a runner.json file");
}

const scriptName = process.argv[2];
if (!scriptName) {
    output.exit("You must provide a script name");
}

const scriptPath = path.join(__dirname, "lib", "script", scriptName);
const scriptFile = fs.readFileSync(path.join(__dirname, "scripts.json"));
const scriptData = JSON.parse(scriptFile.toString());

if (scriptData && scriptData[scriptName]) {
    const configFile   = fs.readFileSync(`${currentPath}/runner.json`);
    const configData   = JSON.parse(configFile.toString());
    const configScript = configData[scriptName];
    const params       = process.argv.slice(3);

    const [ config, args ] = Config.parse(scriptData[scriptName], configScript, params);
    require(scriptPath)(config, args);
}
