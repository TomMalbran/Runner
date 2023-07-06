const Input   = require("../utils/input");
const Output  = require("../utils/output");
const Command = require("../utils/command");
const Path    = require("path");



/**
 * Parses the Config and Params
 * @param {String} scriptName
 * @param {Object} scriptData
 * @param {Object} configData
 * @param {Object} params
 * @returns {Promise}
 */
async function parse(scriptName, scriptData, configData, params) {
    const script = scriptData[scriptName];
    const data   = configData.scripts[scriptName];
    const config = {
        isSilent : params.includes("--silent"),
    };


    for (const [ key, value ] of Object.entries(configData)) {
        if (key !== "scripts") {
            config[key] = value;
        }
    }

    if (script.reqConfig && !data) {
        Output.exit("The config is required");
        return [];
    }

    // Script requires no config, just return it empty
    if (!script.reqConfig) {
        return getResult(
            config,
            parseParams(script.args, params)
        );
    }

    // Script requires a type and there is one, return the data
    if (hasNoSystem(script, data)) {
        return getResult(
            parseConfig(config, data),
            parseParams(script.args, params)
        );
    }

    // Script has systems, try to get it
    if (script.hasSystem) {
        const options = Object.keys(data).filter((key) => key !== "all");
        const system  = await Input.valueOrChoice(params[0], "system", options);
        const args    = { system, params : params.slice(1) };
        const subData = data[args.system];

        if (!subData || args.system === "all") {
            Output.exit("The system doesn't exists");
            return {};
        }
        if ((script.reqType && subData.type) || (!script.reqType && subData)) {
            return getResult(
                parseConfig(config, subData, data.all, system),
                parseArgs(script.args, args)
            );
        }
    }

    // Script requires a config
    if (script.reqConfig) {
        return getResult(
            parseConfig(config, data),
            parseParams(script.args, params)
        );
    }

    // The config is invalid
    Output.exit("The config is invalid");
    return [];
}

/**
 * There is no System
 * @param {Object} script
 * @param {Object} data
 * @returns {Boolean}
 */
function hasNoSystem(script, data) {
    if (script.reqType && data.type) {
        return true;
    }
    if (script.reqArg && data[script.reqArg]) {
        return true;
    }
    if (!script.reqType && !script.hasSystem) {
        return true;
    }
    return false;
}

/**
 * Parses the Environment and returns all the config
 * @param {Object} config
 * @param {Object} args
 * @returns {{config: Object, args: Object, env: Object}}
 */
function getResult(config, args) {
    const env = {
        name     : config.system,
        isDev    : config.isDev    || args.dev    || config.system === "dev",
        isStage  : config.isStage  || args.stage  || config.system === "stage",
        isPreapp : config.isPreapp || args.preapp || config.system === "preapp",
        isProd   : config.isProd   || args.prod   || config.system === "prod",
    };
    if (env.isDev) {
        env.name = "dev";
    } else if (env.isStage) {
        env.name = "stage";
    } else if (env.isPreapp) {
        env.name = "preapp";
    } else if (env.isProd) {
        env.name = "prod";
    }

    return { config, args, env };
}

/**
 * Parses the Params
 * @param {Array} args
 * @param {Array} params
 * @returns {Object}
 */
function parseParams(args, params) {
    const values   = [];
    const result   = { rest : "", values };
    const argsList = args.filter((arg) => !arg.startsWith("--"));
    let   index    = 0;

    for (const param of params) {
        if (param.startsWith("--")) {
            result[param.substr(2)] = true;
        } else if (argsList[index]) {
            result[argsList[index]] = param;
            index += 1;
        }
        result.rest += `${param} `;
        result.values.push(param);
    }
    return result;
}

/**
 * Parses the Arguments
 * @param {Object} args
 * @param {Object} params
 * @returns {Object}
 */
function parseArgs(args, params) {
    const others = parseParams(args, params.params);
    return { ...args, ...others };
}

/**
 * Parses the Config
 * @param {Object}  config
 * @param {Object}  data
 * @param {Object=} allData
 * @param {String=} system
 * @returns {Object}
 */
function parseConfig(config, data, allData, system) {
    let result = {};
    if (Array.isArray(data)) {
        result = { ...config, data };
    } else if (allData) {
        result = { ...config, ...allData, ...data };
    } else {
        result = { ...config, ...data };
    }
    result.system     = system;
    result.libraryDir = Path.resolve(__dirname, "..", "..", "..");
    result.currentDir = process.cwd();
    return result;
}



/**
 * Returns the Url using the given Config
 * @param {Object} config
 * @return {String}
 */
function getUrl(config) {
    let url = config.local;
    if (config.path) {
        url = `${config.local}${config.path}`;
    } else if (config.url) {
        url = config.url;
    }
    return url;
}

/**
 * Returns the React env depending on the arguments
 * @param {Object} env
 * @returns {String}
 */
function getReactEnv(env) {
    let result = "";
    if (env.isDev) {
        result = "env-cmd -f .env.dev ";
    } else if (env.isStage) {
        result = "env-cmd -f .env.stage ";
    } else if (env.isPreapp) {
        result = "env-cmd -f .env.preapp ";
    } else if (env.isProd) {
        result = "";
    }
    return result;
}

/**
 * Returns the Flutter file depending on the arguments
 * @param {Object} env
 * @returns {String}
 */
function getFlutterFile(env) {
    let result = "Local";
    if (env.isDev) {
        result = "Dev";
    } else if (env.isStage) {
        result = "Stage";
    } else if (env.isPreapp) {
        result = "Preapp";
    } else if (env.isProd) {
        result = "Prod";
    }
    return result;
}

/**
 * Returns the Cordova env depending on the arguments
 * @param {Object} env
 * @returns {String}
 */
function getCordovaEnv(env) {
    return env.isStage ? ".env.app.stage" : ".env.app.production";
}



/**
 * Updates the Build
 * @param {Object} config
 * @param {Object} args
 * @returns {Boolean}
 */
function updateBuild(config, args) {
    if (args.nobuild) {
        Command.execSilent("runner version set");
        return false;
    }

    Output.step("Updating the Build Number");
    Command.execSilent("runner version build");

    config.build = Number(config.build) + 1;
    Output.tab("Version", `${config.version}-${config.build}`);
    Output.line();
    return true;
}

/**
 * Restores the Build
 * @returns {Void}
 */
function restoreBuild() {
    Command.execSilent("runner version restore");
}




// The public API
module.exports = {
    parse,
    getUrl,
    getReactEnv,
    getFlutterFile,
    getCordovaEnv,

    updateBuild,
    restoreBuild,
};
