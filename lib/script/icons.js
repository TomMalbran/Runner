const Command = require("../utils/command");
const Output  = require("../utils/output");
const FS      = require("fs");



/**
 * Runs the Date script
 * @param {Object} config
 * @returns {Boolean}
 */
function run(config) {
    Output.line();

    const fontName = config.font || "icomoon";
    if (FS.existsSync(config.input)) {
        Output.step(`Removing old ${fontName}`);
        Command.remove("-rf", config.input);
    }

    Output.step(`Unzipping ${fontName}`);
    Command.exec(`unzip -qq ${config.input}.zip -d ${config.input}`);

    Output.step("Copying the fonts");
    const fonts = Array.isArray(config.fonts) ? config.fonts : [ config.fonts ];
    for (const font of fonts) {
        Command.mkdir(font);
        Command.copy("-f", `${config.input}/fonts/${fontName}.svg`, font);
        Command.copy("-f", `${config.input}/fonts/${fontName}.ttf`, font);
        Command.copy("-f", `${config.input}/fonts/${fontName}.woff`, font);
    }

    Output.step("Generating the stylesheet");
    const outputs = Array.isArray(config.style) ? config.style : [ config.style ];
    const style   = FS.readFileSync(`${config.input}/style.css`);
    const lines   = style.toString().split("\n");
    lines.splice(0, 25);
    for (const output of outputs) {
        Command.mkdir(output.substring(0, output.lastIndexOf("/")));
        FS.writeFileSync(output, lines.join("\n"), { flag : "w" });
    }

    return true;
}



// The public API
module.exports = run;
