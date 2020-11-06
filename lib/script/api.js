const Command  = require("../utils/command");
const Input    = require("../utils/input");
const Output   = require("../utils/output");
const Config   = require("../utils/config");

const inquirer = require("inquirer");



/**
 * Runs the Migrations script
 * @param {Object} config
 * @returns {Promise}
 */
async function run(config) {
    Output.subtitle(`Executing the API ${config.system}`);

    const url = Config.getUrl(config);
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        Output.exit("The url must start with http:// or https://");
    } else if (!config.token) {
        Output.exit("The token is required");
    } else {
        Output.tab("url", url);
        Output.line();
    }

    const questions = [];
    for (const [ key, desc ] of Object.entries(config.params)) {
        questions.push({
            name     : key,
            type     : "input",
            message  : `${key} (${desc}):`,
            validate : (value) => {
                if (value.length) {
                    return true;
                }
                return `Please enter the value of ${key}.`;
            }
        });
    }

    let done    = false;
    let answers = null;
    while (!done) {
        answers = await inquirer.prompt(questions);
        Output.line();
        done    = await Input.confirm("Is this correct");
        Output.line();
    }

    answers.token = config.token;
    const result  = await Command.fetch(url, "POST", answers);
    Output.step("Output");
    Output.html(result);

    return true;
}



// The public API
module.exports = run;
