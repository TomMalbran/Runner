const Output   = require("../utils/output");
const inquirer = require("inquirer");



/**
 * Asks for a value
 * @param {string} text
 * @returns {Promise}
 */
async function confirm(text) {
    // @ts-ignore
    const answers = await inquirer.prompt({
        name    : "confirm",
        type    : "confirm",
        message : `${text}:`,
    });
    return answers.confirm;
}

/**
 * Asks for a value
 * @param {string} name
 * @returns {Promise}
 */
async function prompt(name) {
    // @ts-ignore
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
 * @param {string} value
 * @param {string} name
 * @returns {Promise}
 */
async function valueOrPrompt(value, name) {
    if (value) {
        return value;
    }
    Output.line();
    return await prompt(name);
}



/**
 * Asks for a value
 * @param {string} name
 * @param {Array}  options
 * @returns {Promise}
 */
async function choice(name, options) {
    Output.line();

    // @ts-ignore
    options.push(new inquirer.Separator());
    options.push("exit");

    // @ts-ignore
    const answers = await inquirer.prompt({
        name     : name,
        type     : "list",
        message  : `${name}:`,
        choices  : options,
        pageSize : options.length,
        validate : (value) => {
            if (value.length) {
                return true;
            }
            return `Please select a ${name}.`;
        }
    });

    if (answers[name] === "exit") {
        Output.done();
        process.exit();
    }
    return answers[name];
}

/**
 * Returns the value or asks for it
 * @param {string}   value
 * @param {string}   name
 * @param {string[]} options
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

