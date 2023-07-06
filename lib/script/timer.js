const Input    = require("../utils/input");
const Output   = require("../utils/output");

const chalk    = require("chalk");
const inquirer = require("inquirer");



/**
 * Runs the Timer script
 * @returns {Promise}
 */
async function run() {
    const ui       = new inquirer.ui.BottomBar();
    let   time     = 0;
    let   interval = null;

    Output.line();
    printTime("Timer started at", parseDate());

    const runTimer = () => {
        Output.line();
        stopTimer();
        interval = setInterval(() => {
            time += 1;
            ui.updateBottomBar(` ${chalk.magenta("Time passed:")} ${parseTimer(time)}`);
        }, 1000);
    };

    const stopTimer = () => {
        Input.confirm("Stop the timer").then((stop) => {
            if (stop) {
                clearInterval(interval);
                printTime("Current time at", parseTimer(time));
                printTime("Timer stopped at", parseDate());
                startTimer();
            } else {
                stopTimer();
            }
        });
    };

    const startTimer = () => {
        Input.choice("Select an Option", [
            "continue timer",
            "restart timer",
            "end timer",
        ]).then((answer) => {
            switch (answer) {
            case "continue timer":
                printTime("Timer continued at", parseDate());
                runTimer();
                break;
            case "restart timer":
                time = 0;
                printTime("Timer restarted at", parseDate());
                runTimer();
                break;
            case "end timer":
                printTime("Timer ended at", parseDate());
                printTime("Total time", parseTimer(time));
                Output.done();
                break;
            default:
            }
        });
    };


    runTimer();

    process.on("SIGINT", () => {
        clearInterval(interval);
    });

    return false;
}

/**
 * Prints a Time
 * @param {String} text
 * @param {String} time
 * @returns {Void}
 */
function printTime(text, time) {
    console.log(chalk.magenta(` ${text}: `) + time);
}

/**
 * Parses a Date
 * @returns {String}
 */
function parseDate() {
    const newDate = new Date();
    return parseTime(newDate.getHours(), newDate.getMinutes(), newDate.getSeconds());
}

/**
 * Parses the Timer in Seconds to a text
 * @param {Number} time
 * @returns {String}
 */
function parseTimer(time) {
    const hours   = Math.floor(time / 3600);
    const minutes = Math.floor(time / 60) - hours * 60;
    const seconds = time - minutes * 60 - hours * 3600;
    return parseTime(hours, minutes, seconds);
}

/**
 * Parses the Hours, Minutes and Seconds to a text
 * @param {Number} hours
 * @param {Number} minutes
 * @param {Number} seconds
 * @returns {String}
 */
function parseTime(hours, minutes, seconds) {
    const ht = hours < 10   ? `0${hours}`   : hours;
    const mt = minutes < 10 ? `0${minutes}` : minutes;
    const st = seconds < 10 ? `0${seconds}` : seconds;

    return `${ht}:${mt}:${st}`;
}



// The public API
module.exports = run;
