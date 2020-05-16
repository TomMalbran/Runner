const Command = require("../utils/command");
const Output  = require("../utils/output");



/**
 * Runs the Library script
 * @param {Object} config
 * @param {Object} args
 * @returns {Void}
 */
function run(config, args) {
    Output.title("Updating a Library");
    
    // Run the Command
    switch (config.type) {
    case "dashboard":
        Output.subtitle("Updating the Dashboard");
        
        Output.step("Building the Components");
        Command.cd(`${config.libraryDir}/Dashboard`);
        Command.execChild("npm run build");
        
        Output.line();
        Output.step("Copying the Files");
        Command.copy("-R", "dist", `${config.currentDir}/${config.path}/node_modules/dashboard`);
        break;

    case "framework":
        Output.subtitle("Updating the Framework");
        Command.copy("-R", `${config.libraryDir}/Framework/data`, `${config.currentDir}/${config.path}/vendor/tommalbran/framework`);
        Command.copy("-R", `${config.libraryDir}/Framework/src`, `${config.currentDir}/${config.path}/vendor/tommalbran/framework`);
        break;
    
    case "directadmin":
        Output.subtitle("Updating DirectAdmin");
        Command.copy("-R", `${config.libraryDir}/DirectAdmin/src`, `${config.currentDir}/${config.path}/vendor/tommalbran/directadmin`);
        break;
    
    default:
        Output.error("The type is invalid");
        return;
    }

    Output.done();
};



// The public API
module.exports = run;
