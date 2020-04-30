const chalk  = require("chalk");



/**
 * Runs the Timer script
 * @param {Object} config
 * @param {Object} args
 * @returns {Promise}
 */
async function run(config, args) {
    const date  = new Date();
    const start = parseTime(date.getHours(), date.getMinutes(), date.getSeconds());
    let   time  = 0;

    console.log("");
    console.log(chalk.magenta(" Timer started at: ") + start);
    console.log("");

    const interval = setInterval(() => {
        time += 1;

        const hours   = Math.floor(time / 3600);
        const minutes = Math.floor(time / 60) - hours * 60;
        const seconds = time - minutes * 60 - hours * 3600;
        const timer   = parseTime(hours, minutes, seconds);

        process.stdout.write(`\r\x1b[K ${chalk.magenta("Time passed:")} ${timer}`);
    }, 1000);
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
