const Output   = require("../utils/output");
const inquirer = require("inquirer");



/**
 * Asks for a value
 * @param {String} name
 * @returns {Promise}
 */
async function prompt(name) {
    const answers = await inquirer.prompt({
        name     : name,
        type     : "input",
        message  : `Enter the ${name}:`,
        validate : (value) => {
            if (value.length) {
                return true;
            }
            return `Please enter the ${name}.`;
        }
    });
    Output.line();
    return answers[name];
}

/**
 * Returns the value or asks for it
 * @param {String} value
 * @param {String} name
 * @returns {Promise}
 */
async function valueOrPrompt(value, name) {
    if (value) {
        return value;
    }
    return await prompt(name);
}



/**
 * Asks for a value
 * @param {String} name
 * @param {Array}  options
 * @returns {Promise}
 */
async function choice(name, options) {
    Output.line();

    options.push(new inquirer.Separator());
    options.push("exit");
    const answers = await inquirer.prompt({
        name     : name,
        type     : "list",
        message  : `Select a ${name}:`,
        choices  : options,
        pageSize : options.length,
        validate : (value) => {
            if (value.length) {
                return true;
            }
            return `Please select a ${name}.`;
        }
    });
    if (answers[name] === "- exit") {
        Output.done();
        process.exit();
    }
    Output.line();
    return answers[name];
}

/**
 * Returns the value or asks for it
 * @param {String}   value
 * @param {String}   name
 * @param {String[]} options
 * @returns {Promise}
 */
async function valueOrChoice(value, name, options) {
    if (value) {
        return value;
    }
    return await choice(name, options);
}



// The public API
module.exports = {
    confirm,
    prompt,
    valueOrPrompt,
    choice,
    valueOrChoice,
};

