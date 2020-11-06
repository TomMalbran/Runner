const Input  = require("../utils/input");
const Output = require("../utils/output");

const chalk  = require("chalk");
const inquirer = require("inquirer");



/**
 * Runs the Timer script
 * @returns {Promise}
 */
async function run() {
    const date     = new Date();
    const start    = parseTime(date.getHours(), date.getMinutes(), date.getSeconds());
    var   ui       = new inquirer.ui.BottomBar();
    let   interval = null;
    let   time     = 0;

    Output.line();
    console.log(chalk.magenta(" Timer started at: ") + start);
    Output.line();

    const runTimer = () => {
        stopTimer();
        Output.line();
        interval = setInterval(() => {
            time += 1;
            ui.updateBottomBar(` ${chalk.magenta("Time passed:")} ${parseTimer(time)}`);
        }, 1000);
    };

    const stopTimer = () => {
        Input.confirm("Stop the timer").then((stopp) => {
            if (stopp) {
                clearInterval(interval);
                console.log(chalk.magenta(" Current time at: ") + parseTimer(time));
                Output.line();
                startTimer();
            } else {
                Output.line();
                stopTimer();
            }
        });
    };

    const startTimer = () => {
        Input.confirm("Restart the timer").then((restart) => {
            if (restart) {
                Output.line();
                runTimer();
            } else {
                console.log(chalk.magenta(" Total time: ") + parseTimer(time));
                Output.done();
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
