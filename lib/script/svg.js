const Command = require("../utils/command");
const Input  = require("../utils/input");
const Output = require("../utils/output");



/**
 * Runs the SVG script
 * @param {Object} config
 * @param {Object} args
 * @returns {Promise}
 */
async function run(config, args) {
    let file = await Input.valueOrPrompt(args.file, "file");

    if (args.downloads) {
        file = `../../../Downloads/${file}`;
    }

    Output.line();
    Output.bold(`Converting the file ${file}.svg`);

    Command.execSilent(`convert ${file}.png -fx 'a==0 ? white : u' ${file}.pnm`);
    Command.execSilent(`potrace -s -o ${file}.svg ${file}.pnm`);
    Command.execSilent(`rm ${file}.pnm`);

    Output.line();
    const response = await Input.confirm("Do you want to open de file?");
    if (response) {
        Command.execSilent(`open ${file}.svg`);
    }

    return true;
}



// The public API
module.exports = run;
