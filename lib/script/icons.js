const Command   = require("../utils/command");
const Output    = require("../utils/output");
const SvgToFont = require("svgtofont");
const FS        = require("fs");



/**
 * Runs the Icons script
 * @param {object} config
 * @returns {Promise}
 */
async function run(config) {
    Output.info(`Icons for ${config.system}`);
    Output.line();

    const name   = "icon";
    const tmp    = `${config.source}/tmp`;
    const output = `${config.source}/build`;


    if (FS.existsSync(output)) {
        Output.step("Removing old files");
        Command.remove("-rf", output);
    }


    Output.step("Copy the icons");
    Command.mkdir(tmp);
    const folders = Array.isArray(config.icons) ? config.icons : [ config.icons ];
    for (const folder of folders) {
        const source = `${config.source}/${folder}/.`;
        Command.copy("-R", source, tmp);
    }


    Output.step("Generating the Font");
    Output.line();
    // @ts-ignore
    await SvgToFont({
        src              : tmp,
        dist             : output,
        fontName         : name,
        css              : true,
        svgicons2svgfont : {
            fontHeight         : 1000,
            normalize          : true,
            centerHorizontally : true,
            centerVertically   : true,
        },
        website: {
            title   : config.name,
            version : "1",
        }
    });
    Command.remove("-rf", tmp);
    Output.line();


    Output.step("Removing extra files");
    const fileToRemove = [ "symbol.html", "unicode.html" ];
    for (const file of fileToRemove) {
        Command.remove("-f", `${output}/${file}`);
    }
    const extToRemove = [ "less", "module.less", "scss", "styl", "symbol.svg" ];
    for (const ext of extToRemove) {
        Command.remove("-f", `${output}/${name}.${ext}`);
    }
    Command.remove("-rf", `${output}/styles`);


    Output.step("Generating the stylesheet");
    const style = FS.readFileSync(`${output}/${name}.css`);
    const lines = style.toString().split("\n");
    lines.splice(0, 18);
    FS.writeFileSync(config.style, lines.join("\n"), { flag : "w" });


    Output.step("Copying the fonts");
    Command.mkdir(config.font);
    Command.copy("-f", `${output}/${name}.ttf`, config.font);
    Command.copy("-f", `${output}/${name}.woff`, config.font);

    return true;
}



// The public API
module.exports = run;
