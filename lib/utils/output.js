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
 * Show a subtitle
 * @param {String} text
 * @returns {Void}
 */
function subtitle(text) {
    console.log(chalk.yellow(` - ${text} - \n`));
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

/**
 * Show an error text and exists
 * @param {String} text
 * @returns {Void}
 */
function exit(text) {
    console.log(chalk.red(` ${text}\n`));
    process.exit();
}

/**
 * Add a line
 * @returns {Void}
 */
function line() {
    console.log("\n");
}




// The public API
module.exports = {
    title,
    subtitle,
    text,
    bold,
    error,
    done,    
    exit,
    line,
};
