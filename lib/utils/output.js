const chalk  = require("chalk");
const figlet = require("figlet");

let name  = "";
let count = 1;



/**
 * Sets the terminal title
 * @param {string} text
 * @returns {void}
 */
function setTerminalTitle(text) {
    let title = "";
    if (!name) {
        name  = text;
        title = text;
    } else {
        title = `${name}: ${text}`;
    }
    process.stdout.write(`\x1b]2;${title}\x1b\x5c`);
}

/**
 * Show a logo
 * @param {string}   text
 * @param {boolean=} isSilent
 * @returns {void}
 */
function logo(text, isSilent = false) {
    if (!isSilent) {
        console.log(chalk.yellow(
            figlet.textSync(text, { horizontalLayout : "full" })
        ));
    }
    setTerminalTitle(text);
}

/**
 * Show a title
 * @param {string}   text
 * @param {boolean=} isSilent
 * @returns {void}
 */
function title(text, isSilent = false) {
    if (text && !isSilent) {
        console.log(chalk.bold(chalk.yellow(` - ${text} -`)));
        setTerminalTitle(text);
    }
}

/**
 * Show a subtitle
 * @param {string}   text
 * @param {boolean=} isSilent
 * @returns {void}
 */
function subtitle(text, isSilent = false) {
    if (text && !isSilent) {
        console.log(chalk.yellow(` - ${text} - \n`));
        setTerminalTitle(text);
    }
}

/**
 * Show an info
 * @param {string}   text
 * @param {boolean=} isSilent
 * @returns {void}
 */
function info(text, isSilent = false) {
    if (text && !isSilent) {
        console.log(chalk.green(` - ${text} - \n`));
    }
}

/**
 * Show the current date
 * @param {boolean=} isSilent
 * @returns {void}
 */
function date(isSilent = false) {
    if (!isSilent) {
        console.log(chalk.green(` - Date: ${new Date().toString()} - \n`));
    }
}

/**
 * Show the execution time
 * @param {number}   startTime
 * @param {number}   endTime
 * @param {boolean=} isSilent
 * @returns {void}
 */
function execution(startTime, endTime, isSilent = false) {
    if (isSilent) {
        return;
    }
    let time   = Math.round((endTime - startTime) / 1000);
    let suffix = "s";
    if (time > 60) {
        time   = Math.round((time / 60) * 100) / 100;
        suffix = "m";
    }
    console.log(chalk.green(` - Execution time: ${time} ${suffix} - \n`));
}

/**
 * Show a subtitle
 * @param {string}   text
 * @param {string}   subtext
 * @param {number=}  maxLength
 * @param {boolean=} isSilent
 * @returns {void}
 */
function tab(text, subtext, maxLength = 0, isSilent = false) {
    if (isSilent) {
        return;
    }

    let name = text[0].toLocaleUpperCase() + text.substr(1) + ":";
    if (maxLength) {
        name = name.padEnd(maxLength + 1);
    }
    console.log(chalk.magenta(` ${name} `) + subtext);
}

/**
 * Show a step
 * @param {string}   text
 * @param {boolean=} isSilent
 * @returns {void}
 */
function step(text, isSilent = false) {
    if (!isSilent) {
        console.log(chalk.cyan(` ${count}- ${text}`));
        count += 1;
    }
}

/**
 * Show a text
 * @param {string}   text
 * @param {boolean=} isSilent
 * @returns {void}
 */
function text(text, isSilent = false) {
    if (!isSilent) {
        console.log(chalk.white(` ${text}`));
    }
}

/**
 * Show a bold text
 * @param {string}   text
 * @param {boolean=} isSilent
 * @returns {void}
 */
function bold(text, isSilent = false) {
    if (!isSilent) {
        console.log(chalk.bold(` ${text}`));
    }
}

/**
 * Show a bold text
 * @param {string}   text
 * @param {boolean=} isSilent
 * @returns {void}
 */
function html(text, isSilent = false) {
    if (isSilent) {
        return;
    }

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

        const parts5 = partial.split("<u>");
        if (parts5.length > 1) {
            const result = [];
            result.push(chalk.white(parts5[0]));
            const parts6 = parts5[1].split("</u>");
            result.push(chalk.green(parts6[0]));
            result.push(chalk.white(parts6[1]));
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
 * @param {string}   text
 * @param {boolean=} isSilent
 * @returns {void}
 */
function error(text, isSilent = false) {
    if (!isSilent) {
        console.log(chalk.red(` ${text}\n`));
    }
}



/**
 * Show a done text
 * @param {boolean=} isSilent
 * @returns {void}
 */
function done(isSilent = false) {
    if (!isSilent) {
        console.log(chalk.green("\n Done !\n"));
    }
}

/**
 * Show an error text and exists
 * @param {string}   text
 * @param {boolean=} isSilent
 * @returns {void}
 */
function exit(text, isSilent = false) {
    if (!isSilent) {
        console.log(chalk.red(` ${text}\n`));
    }
    process.exit();
}

/**
 * Show a result text and exists
 * @param {string} text
 * @returns {void}
 */
function result(text) {
    console.log(text);
    process.exit();
}

/**
 * Add a line
 * @param {boolean=} isSilent
 * @returns {void}
 */
function line(isSilent = false) {
    if (!isSilent) {
        console.log("");
    }
}



// The public API
module.exports = {
    logo,
    title,
    subtitle,
    info,
    date,
    execution,
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
