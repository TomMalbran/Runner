const Command = require("../utils/command");
const Output  = require("../utils/output");
const Config  = require("../utils/config");



/**
 * Runs the Migrations script
 * @param {Object} config
 * @param {Object} args
 * @returns {Promise}
 */
async function run(config, args) {
    Output.line();

    let   url       = args.url || Config.getUrl(config);
    const maxLength = "delete".length;

    if (!url) {
        Output.exit("A url for the migrations script is required");
    }
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        Output.exit("The url must start with http:// or https://");
    }
    if (!url.includes("?") && !url.includes("migrations.php")) {
        url += "/migrations.php";
    }

    if (args.create) {
        if (!config.database || !config.username || !config.password) {
            Output.exit("You must provide the database name, user and password in the config to create it");
        }
        Output.step("Creating the database");
        let sql = `
            CREATE DATABASE IF NOT EXISTS ${config.database} /*\!40100 DEFAULT CHARACTER SET utf8 */;
            CREATE USER '${config.username}'@'localhost' IDENTIFIED BY '${config.password}';
            GRANT ALL PRIVILEGES ON ${config.database}.* TO '${config.username}'@'localhost';
            FLUSH PRIVILEGES;
        `;
        Command.execChild(`mysql --silent -uroot -proot -e "${sql}"`);
        Output.line();
    }

    Output.step("Options");
    Output.tab("url",    url, maxLength);
    Output.tab("user",   args.user   ? "yes" : "no", maxLength);
    Output.tab("delete", args.delete ? "yes" : "no", maxLength);
    Output.line();

    const result = await Command.fetch(url, "POST", {
        "user"   : args.user   ? 1 : 0,
        "delete" : args.delete ? 1 : 0,
    });
    Output.step("Output");
    Output.html(result);

    return true;
}



// The public API
module.exports = run;
