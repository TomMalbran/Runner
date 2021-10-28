const Command = require("../utils/command");
const Output  = require("../utils/output");



/**
 * Runs the Update script
 * @param {Object} config
 * @returns {Boolean}
 */
function run(config) {
    // Run the Command
    switch (config.type) {
    case "react":
        Output.subtitle("Updating React");
        Command.cdIf(config);
        Command.exec("ncu -u");
        Command.exec("npm update");
        break;

    case "node":
        Output.subtitle("Updating Node");
        Command.cdIf(config);
        Command.exec("npm update");
        break;

    case "flutter":
        Output.subtitle("Updating Flutter");
        Command.cdIf(config);
        Command.exec("flutter upgrade");
        break;

    case "composer":
        Output.subtitle("Updating Composer");
        Command.cdIf(config);
        Command.execChild("composer update");
        Command.cd("vendor");
        for (const dir of [ ".git", "test", "tests", "example", "examples", "docs" ]) {
            Command.exec(`find . -mindepth 2 -type d -name ${dir} | xargs rm -rf`);
        }
        break;

    default:
        Output.error("The type is invalid");
    }

    return true;
};



// The public API
module.exports = run;
