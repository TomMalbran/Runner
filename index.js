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
    output.error("You must have a runner.json file");
    process.exit();
}

const scriptName = process.argv[2];
if (!scriptName) {
    output.error("You must provide a script name");
    process.exit();
}

const configData   = fs.readFileSync(`${currentPath}/runner.json`);
const config       = JSON.parse(configData.toString());
const scriptConfig = config[scriptName];
if (!scriptConfig) {
    output.error("You must provide a script config");
    process.exit();
}

const scriptPath = path.join(__dirname, "lib", "script", scriptName);
const params     = process.argv.slice(3);
if (fs.existsSync(`${scriptPath}.js`)) {
    require(scriptPath)(scriptConfig, params);
}
