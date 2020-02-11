const Output  = require("../utils/output");
const Command = require("../utils/command");



/**
 * Runs the Deploy script
 * @param {Object} config
 * @param {Object} args
 * @returns {Promise}
 */
async function run(config, args) {
    Output.title("Deploys the System");
    Output.line();

    Output.instruction("Updating the Version");
    Command.execSilent("runner version build");
    
    Output.instruction("Building the App");
    Command.pushdIf(config.path);
    if (config.stage) {
        Command.exec("env-cmd -f .env.stage npm run build");
    } else {
        Command.exec("npm run build");
    }
    Command.popdIf(config.path);
    
    const ftp = `-u ${config.user},${config.pass} ${config.host}`;
    Output.instruction("Uploading the Client");
    Command.exec(`lftp -e "set ftp:ssl-allow no; mirror -R -r ${config.local}/client ${config.remote}; quit" ${ftp}`);
    Command.exec(`lftp -e "set ftp:ssl-allow no; mirror -R -e ${config.local}/client/static ${config.remote}/static; quit" ${ftp}`);
    
    Output.instruction("Uploading the Server");
    Command.exec(`lftp -e "set ftp:ssl-allow no; mirror -R ${config.local}/server ${config.remote}/server; quit" ${ftp}`);
    
    Output.instruction("Executing the Migrations");
    Command.execSilent(`runner migrations ${args.delete ? "--delete" : " "}`);

    Output.done();
}



// The public API
module.exports = run;
