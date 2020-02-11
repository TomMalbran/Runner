const Output = require("../utils/output");
const Fetch  = require("node-fetch");



/**
 * Runs the Migrations script
 * @param {Object} config
 * @param {Object} args
 * @returns {Promise}
 */
async function run(config, args) {
    Output.title("Executing the Migrations");
    Output.line();

    if (!config.url) {
        Output.exit("The url is required");
    }

    const url    = `${config.url}/${config.path}/migrations.php`;
    const params = new URLSearchParams();
    params.append("user",     args.user     ? "1" : "0");
    params.append("delete",   args.delete   ? "1" : "0");
    params.append("recreate", args.recreate ? "1" : "0");
    
    const result   = await Fetch(url, { method : "POST", body : params });
    const response = await result.text();
    const lines    = response.split("<br>");
    
    for (const line of lines) {
        Output.html(line);
    }
    
    Output.done();
}



// The public API
module.exports = run;
