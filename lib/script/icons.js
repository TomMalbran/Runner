const Command = require("../utils/command");
const Output  = require("../utils/output");
const FS      = require("fs");



/**
 * Runs the Date script
 * @param {Object} config
 * @param {Object} args
 * @returns {Void}
 */
function run(config, args) {
    Output.title("Updating the Icons");
    Output.line();
    
    if (FS.existsSync(config.input)) {
        Output.step("Removing old icomoon");
        Command.remove("-rf", config.input);
    }
    
    Output.step("Unzipping icomoon");
    Command.exec(`unzip -qq ${config.input}.zip -d ${config.input}`);
    
    Output.step("Copying the fonts");
    Command.copy("-f", `${config.input}/fonts/icomoon.svg`, config.fonts);
    Command.copy("-f", `${config.input}/fonts/icomoon.ttf`, config.fonts);
    Command.copy("-f", `${config.input}/fonts/icomoon.woff`, config.fonts);
    
    Output.step("Generating the stylesheet");
    const styles = FS.readFileSync(`${config.input}/style.css`);
    const lines  = styles.toString().split("\n");
    lines.splice(0, 25);
    FS.writeFileSync(config.style, lines.join("\n"));

    Output.done();
}



// The public API
module.exports = run;
