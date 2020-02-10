const Output = require("../utils/output");
const Shell  = require("shelljs");



/**
 * Runs the Install script
 * @param {Object} config
 * @param {Object} args
 * @returns {Promise}
 */
async function run(config, args) {
    Output.title("Installs a Module");
    let module;
    if (config.type !== "flutter") {
        module = await Input.valueOrPrompt(args.module, "module");
    }

    // Run the Command
    switch (config.type) {
    case "react":
        Output.subtitle("Installing a React Module");
        Shell.cd(config.path);
        Shell.exec(`npm install --save ${module}`);
        break;
    
    case "flutter":
        Output.subtitle("Installing a Flutter Module");
        Shell.cd(config.path);
        Shell.exec("flutter pub get");
        break;
    
    case "composer":
        Output.subtitle("Installing a Composer Module");
        Shell.cd(config.path);
        Shell.exec(`composer require ${module}`);
        break;
    
    default:
        Output.error("The type is invalid");
        return;
    }

    Output.done();
};



// The public API
module.exports = run;
