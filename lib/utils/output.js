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
 * Show a bold text
 * @param {String} text
 * @returns {Void}
 */
function html(text) {
    const result = [];
    const parts1 = text.split("<i>");
    if (parts1.length > 1) {
        result.push(chalk.white(parts1[0]));
        const parts2 = parts1[1].split("</i>");
        result.push(chalk.yellow(parts2[0]));
        result.push(chalk.white(parts2[1]));
    }
    const parts3 = text.split("<b>");
    if (parts3.length > 1) {
        result.push(chalk.white(parts3[0]));
        const parts4 = parts3[1].split("</b>");
        result.push(chalk.magenta(parts4[0]));
        result.push(chalk.white(parts4[1]));
    }

    if (result.length) {
        console.log(" " + result.join(""));
    } else {
        console.log(chalk.white(` ${text}`));
    }
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
    html,
    done,    
    exit,
    line,
};
