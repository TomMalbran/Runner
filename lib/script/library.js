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
    case "dashboard": {
        Output.subtitle("Updating the Dashboard");
        const directories = [ "Components", "Core", "Hooks", "Utils" ];
        const fromPath    = `${config.libraryDir}/Dashboard`;
        const toPath      = `${config.currentDir}/${config.path}/src/Dashboard`;

        for (const dir of directories) {
            Command.copy("-R", `${fromPath}/src/${dir}`, toPath);
        }
        Command.copy("-f", `${fromPath}/src/Dashboard.js`, toPath);
        break;
    }

    case "editor": {
        Output.subtitle("Updating the Editor");
        const directories = [ "Components", "Data", "Elements", "Entities", "NLS", "Utils" ];
        const fromPath    = `${config.libraryDir}/Editor`;
        const toPath      = `${config.currentDir}/${config.path}/src/Editor`;

        for (const dir of directories) {
            Command.copy("-R", `${fromPath}/src/${dir}`, toPath);
        }
        Command.copy("-f", `${fromPath}/src/Editor.js`, toPath);
        Command.copy("-f", `${fromPath}/src/Site.js`, toPath);
        Command.copy("-R", `${fromPath}/public`, `${config.currentDir}/${config.path}`);
        break;
    }

    case "framework": {
        Output.subtitle("Updating the Framework");
        const directories = [ "data", "src" ];
        const fromPath    = `${config.libraryDir}/Framework`;
        const toPath      = `${config.currentDir}/${config.path}/vendor/tommalbran/framework`;

        for (const dir of directories) {
            Command.copy("-R", `${fromPath}/${dir}`, toPath);
        }
        break;
    }

    case "directadmin": {
        Output.subtitle("Updating DirectAdmin");
        const fromPath = `${config.libraryDir}/DirectAdmin`;
        const toPath   = `${config.currentDir}/${config.path}/vendor/tommalbran/directadmin`;

        Command.copy("-R", `${fromPath}/src`, toPath);
        break;
    }

    case "admin": {
        Output.subtitle("Updating Admin");
        const directories = [ "data", "public", "lib", "src" ];
        const fromPath    = `${config.libraryDir}/Admin`;
        const toPath      = `${config.currentDir}/${config.path}/vendor/tommalbran/admin`;

        for (const dir of directories) {
            Command.copy("-R", `${fromPath}/${dir}`, toPath);
        }
        break;
    }

    default:
        Output.error("The type is invalid");
    }

    return true;
};



// The public API
module.exports = run;
