const Input   = require("../utils/input");
const Output  = require("../utils/output");

const Spinner = require("cli-spinner").Spinner;
const spawn   = require("child_process").spawn;



/**
 * Runs the Script script
 * @param {object} config
 * @returns {Promise}
 */
async function run(config) {
    if (config.title) {
        Output.subtitle(config.title);
    } else {
        Output.line();
    }
    Output.date();

    if (!config.commands) {
        Output.exit("The commands are required");
    }
    if (config.question) {
        const response = await Input.confirm(config.question);
        Output.line();
        if (!response) {
            Output.exit("The execution was stopped");
            return;
        }
    }

    const spinner = new Spinner(" - Executing... %s");
    spinner.setSpinnerString("|/-\\");

    for (const { title, command } of config.commands) {
        Output.step(title);
        const startTime = Date.now();
        await runCommand(`runner ${command} --silent`, spinner);
        const endTime = Date.now();
        Output.line();
        Output.execution(startTime, endTime);
    }

    return true;
}

/**
 * Runs the Command with a Spinner
 * @param {string}  command
 * @param {Spinner} spinner
 * @returns {Promise}
 */
function runCommand(command, spinner) {
    return new Promise((resolve) => {
        const process = spawn(command, { shell: true });
        spinner.start();
        process.on("exit", () => {
            spinner.stop();
            resolve(true);
        });
    });
}



// The public API
module.exports = run;
