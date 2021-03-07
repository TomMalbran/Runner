const Output  = require("../utils/output");
const Command = require("../utils/command");
const FS      = require("fs");



/**
 * Runs the Minify script
 * @param {Object} config
 * @returns {Boolean}
 */
function run(config) {
    // Run the Command
    switch (config.type) {
    case "css": {
        const build  = `${config.path}/build.css`;
        const input  = `${config.path}/${config.input}`;
        const output = `${config.path}/${config.output}`;

        Output.subtitle("Minifying CSS");
        Output.step("Merging the files");

        const cssFile = FS.readFileSync(input);
        const files   = cssFile.toString().split("\n");
        for (const file of files) {
            const filePath = file.replace("@import \"", "").replace("\";", "");
            if (filePath) {
                const fileData  = FS.readFileSync(`${config.path}/${filePath}`);
                const writeData = fileData.toString().replace(/..\/..\//g, "../");
                FS.appendFileSync(build, writeData);
                Output.text(filePath);
            }
        }
        Output.line();

        Output.step("Minifying the file");
        Command.exec(`cleancss -o ${output} ${build}`);
        Command.remove("-f", build);

        break;
    }

    default:
        Output.error("The type is invalid");
    }

    return true;
};



// The public API
module.exports = run;
