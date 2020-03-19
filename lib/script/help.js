const Command  = require("../utils/command");
const Output   = require("../utils/output");

const Chalk    = require("chalk");
const Inquirer = require('inquirer');



/**
 * Shows the Help
 * @param {Object} scriptData
 * @param {Object} configData
 * @returns {Void}
 */
async function run(scriptData, configData) {
    Output.title("Run a Command");
    Output.line();

    const choices = [];
    for (const [ key, script ] of Object.entries(scriptData)) {
        const config  = configData.scripts[key];
        if (!script.reqConfig) {
            addCommand(choices, key, script);
        } else if (config) {
            if ((script.reqType && config.type) || (!script.reqType && !script.hasSystem)) {
                addCommand(choices, key, script);
            } else if (script.hasSystem) {
                for (const [ subkey, subdata ] of Object.entries(config)) {
                    addCommand(choices, `${key} ${subkey}`, script);
                }
            }
        }
    }

    choices.push({ name : "- exit", value : "exit" });
	const result = await Inquirer.prompt({
        name     : "command",
        type     : "list",
        message  : "Select a command",
        choices  : choices,
        pageSize : choices.length,
    });

    if (result.command !== "exit") {
        Command.execChild(`runner ${result.command}`);
    }
    Output.line();
};

/**
 * Adds a Command to the Choices
 * @param {Array}  choices
 * @param {String} command
 * @param {Object} script
 * @returns {Void}
 */
function addCommand(choices, command, script) {
    let args = "";
    if (script.args.length > 0) {
        for (const arg of script.args) {
            args += ` [${arg}]`;
        }
    }
    choices.push({
        name  : Chalk.cyan(`- ${command}`) + Chalk.white(args),
        value : command,
    });
}



// The public API
module.exports = run;
