const Command = require("../utils/command");
const Output  = require("../utils/output");



/**
 * Runs the Library script
 * @param {Object} config
 * @returns {Boolean}
 */
function run(config) {
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

    case "admin":
        Output.subtitle("Updating Admin");
        Command.copy("-R", `${config.libraryDir}/Admin/data`, `${config.currentDir}/${config.path}/vendor/tommalbran/admin`);
        Command.copy("-R", `${config.libraryDir}/Admin/public`, `${config.currentDir}/${config.path}/vendor/tommalbran/admin`);
        Command.copy("-R", `${config.libraryDir}/Admin/src`, `${config.currentDir}/${config.path}/vendor/tommalbran/admin`);
        break;

    default:
        Output.error("The type is invalid");
    }

    return true;
};



// The public API
module.exports = run;
