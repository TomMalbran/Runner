const Command = require("../utils/command");
const Output  = require("../utils/output");



/**
 * Runs the Migrations script
 * @param {Object} config
 * @param {Object} args
 * @returns {Promise}
 */
async function run(config, args) {
    Output.line();

    if (!config.url) {
        Output.exit("The url is required");
    }

    const maxLength = "recreate".length;
    Output.step("Options");
    Output.tab("user",     args.user     ? "yes" : "no", maxLength);
    Output.tab("delete",   args.delete   ? "yes" : "no", maxLength);
    Output.tab("recreate", args.recreate ? "yes" : "no", maxLength);
    Output.tab("sandbox",  args.sandbox  ? "yes" : "no", maxLength);
    Output.line();

    const result = await Command.fetch(`${config.url}migrations.php`, "POST", {
        "user"     : args.user     ? 1 : 0,
        "delete"   : args.delete   ? 1 : 0,
        "recreate" : args.recreate ? 1 : 0,
        "sandbox"  : args.sandbox  ? 1 : 0,
    });
    Output.step("Output");
    Output.html(result);

    return true;
}



// The public API
module.exports = run;
