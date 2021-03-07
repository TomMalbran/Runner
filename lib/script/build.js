const Output  = require("../utils/output");
const Command = require("../utils/command");
const Config  = require("../utils/config");



/**
 * Runs the Build script
 * @param {Object} config
 * @param {Object} args
 * @returns {Boolean}
 */
function run(config, args) {
    // Run the Command
    switch (config.type) {
    case "react": {
        Output.subtitle("Building React");
        const env = Config.getReactEnv(args);
        Command.cdIf(config);
        Command.exec(`${env}npm run build`);
        break;
    }

    case "node": {
        Output.subtitle("Building Node");
        Command.cdIf(config);
        Command.exec("npm run build");
        break;
    }

    case "flutter": {
        Output.subtitle("Building Flutter");
        const file = Config.getFlutterFile(args);
        Command.cdIf(config);
        Command.exec(`flutter build ios -t lib/main/${file}.dart`);
        break;
    }

    case "cordova": {
        Output.subtitle("Building Cordova");
        Output.step("Building the React App");
        const env = Config.getCordovaEnv(args);
        Command.pushdIf(config);
        Command.exec(`env-cmd -f ${env} npm run build`);
        Command.popdIf(config);
        Output.line();

        Output.step("Moving the Files");
        Command.remove("-rf", "www/images");
        Command.remove("-rf", "www/static");
        Command.move(`${config.path}/build/images`, "www/images");
        Command.move(`${config.path}/build/static`, "www/static");

        Output.step("Deleteing the map Files");
        Command.remove("-f", "www/static/js/*.map");
        Command.remove("-f", "www/static/css/*.map");

        Output.step("Renaming the Compiled Files");
        Command.files("www/static/js").forEach((file) => {
            const name = file.split(".")[0];
            Command.move(`www/static/js/${file}`, `www/static/js/${name}.js`);
        });
        Command.files("www/static/css").forEach((file) => {
            const name = file.split(".")[0];
            Command.move(`www/static/css/${file}`, `www/static/css/${name}.css`);
        });
        break;
    }

    default:
        Output.error("The type is invalid");
    }

    return true;
};



// The public API
module.exports = run;
