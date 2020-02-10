const chalk  = require("chalk");
const figlet = require("figlet");

let count = 1;



/**
 * Show a logo
 * @param {String} text
 * @returns {Void}
 */
function logo(text) {
    console.log(chalk.yellow(
        figlet.textSync(text, { horizontalLayout : "full" })
    ));
}

/**
 * Show a title
 * @param {String} text
 * @returns {Void}
 */
function title(text) {
    console.log(chalk.bold(chalk.yellow(` - ${text} -`)));
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
    console.log(chalk.white(` ${text}`));
}

/**
 * Show an instruction
 * @param {String} text
 * @returns {Void}
 */
function instruction(text) {
    console.log(chalk.cyan(` ${count}- ${text}`));
    count += 1;
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
    console.log(chalk.green("\n Done !\n"));
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
    console.log("");
}



// The public API
module.exports = {
    logo,
    title,
    subtitle,
    text,
    instruction,
    bold,
    error,
    done,    
    exit,
    line,
};
