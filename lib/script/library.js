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

    case "dashsource":
        Output.subtitle("Updating the Dashboard Source");
        Command.copy("-R", `${config.libraryDir}/Dashboard/src/Components`, `${config.currentDir}/${config.path}/src/Dashboard`);
        Command.copy("-R", `${config.libraryDir}/Dashboard/src/Core`, `${config.currentDir}/${config.path}/src/Dashboard`);
        Command.copy("-R", `${config.libraryDir}/Dashboard/src/Utils`, `${config.currentDir}/${config.path}/src/Dashboard`);
        Command.copy("-f", `${config.libraryDir}/Dashboard/src/Dashboard.js`, `${config.currentDir}/${config.path}/src/Dashboard`);
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
        for (const dir of [ "data", "public", "lib", "src" ]) {
            Command.copy("-R", `${config.libraryDir}/Admin/${dir}`, `${config.currentDir}/${config.path}/vendor/tommalbran/admin`);
        }
        break;

    default:
        Output.error("The type is invalid");
    }

    return true;
};



// The public API
module.exports = run;
