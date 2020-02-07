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
    console.log("\n");
    return answers[name];
}



// The public API
module.exports = {
    prompt,
};

