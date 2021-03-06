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
 * @param {String}   text
 * @param {Boolean=} silent
 * @returns {Void}
 */
function title(text, silent) {
    if (text && !silent) {
        console.log(chalk.bold(chalk.yellow(` - ${text} -`)));
    }
}

/**
 * Show a subtitle
 * @param {String}   text
 * @param {Boolean=} silent
 * @returns {Void}
 */
function subtitle(text, silent) {
    if (text && !silent) {
        console.log(chalk.yellow(` - ${text} - \n`));
    }
}

/**
 * Show the current date
 * @param {Boolean=} silent
 * @returns {Void}
 */
function date(silent) {
    if (!silent) {
        console.log(chalk.green(` - Date: ${new Date().toString()} - \n\n`));
    }
}

/**
 * Show a subtitle
 * @param {String}  text
 * @param {String}  subtext
 * @param {Number=} maxLength
 * @returns {Void}
 */
function tab(text, subtext, maxLength) {
    let name = text[0].toLocaleUpperCase() + text.substr(1) + ":";
    if (maxLength) {
        name = name.padEnd(maxLength + 1);
    }
    console.log(chalk.magenta(` ${name} `) + subtext);
}

/**
 * Show a step
 * @param {String} text
 * @returns {Void}
 */
function step(text) {
    console.log(chalk.cyan(` ${count}- ${text}`));
    count += 1;
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
    const lines = text.split("<br>");
    for (const line of lines) {
        let   partial = line;
        const parts1  = partial.split("<i>");
        if (parts1.length > 1) {
            const result = [];
            result.push(chalk.white(parts1[0]));
            const parts2 = parts1[1].split("</i>");
            result.push(chalk.yellow(parts2[0]));
            result.push(chalk.white(parts2[1]));
            partial = result.join("");
        }
        const parts3 = partial.split("<b>");
        if (parts3.length > 1) {
            const result = [];
            result.push(chalk.white(parts3[0]));
            const parts4 = parts3[1].split("</b>");
            result.push(chalk.magenta(parts4[0]));
            result.push(chalk.white(parts4[1]));
            partial = result.join("");
        }

        if (partial != line) {
            console.log(` ${partial}`);
        } else {
            console.log(chalk.white(` ${line}`));
        }
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
 * @param {Boolean=} silent
 * @returns {Void}
 */
function done(silent) {
    if (!silent) {
        console.log(chalk.green("\n Done !\n"));
    }
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
 * Show a result text and exists
 * @param {String} text
 * @returns {Void}
 */
function result(text) {
    console.log(text);
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
    date,
    tab,
    step,
    text,
    bold,
    error,
    html,
    done,
    exit,
    result,
    line,
};
