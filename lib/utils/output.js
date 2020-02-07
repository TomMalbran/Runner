const chalk = require("chalk");



/**
 * Show a title
 * @param {String} text
 * @returns {Void}
 */
function title(text) {
    console.log(chalk.bold(chalk.yellow(` - ${text} - \n`)));
}

/**
 * Show a Line
 * @returns {Void}
 */
function line() {
    console.log("\n");
}

/**
 * Show a text
 * @param {String} text
 * @returns {Void}
 */
function text(text) {
    console.log(` ${text}`);
}

/**
 * Show a bold text
 * @param {String} text
 * @returns {Void}
 */
function bold(text) {
    console.log(chalk.bold(` ${text}`));
}

/**
 * Show an error text
 * @param {String} text
 * @returns {Void}
 */
function error(text) {
    console.log(chalk.red(` ${text}\n`));
}

/**
 * Show a done text
 * @returns {Void}
 */
function done() {
    console.log(chalk.yellow("\n Done !\n"));
}



// The public API
module.exports = {
    title,
    line,
    text,
    bold,
    error,
    done,    
};
