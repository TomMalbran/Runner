const Input  = require("../utils/input");
const Output = require("../utils/output");
const Path   = require("path");



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
    const config = {};

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
        return [ config, parseParams(script.args, params) ];
    }

    // Script requires a type and there is one, return the data
    if ((script.reqType && data.type) || (!script.reqType && !script.hasSystem)) {
        return [
            parseConfig(config, data),
            parseParams(script.args, params),
        ];
    }

    // Script has systems, try to get it
    if (script.hasSystem) {
        const options = Object.keys(data).filter((key) => key !== "all");
        const system  = await Input.valueOrChoice(params[0], "system", options);
        const args    = { system, params : params.slice(1) };
        const subdata = data[args.system];

        if (!subdata || args.system === "all") {
            Output.exit("The system doesn't exists");
            return [];
        }
        if ((script.reqType && subdata.type) || (!script.reqType && subdata)) {
            return [
                parseConfig(config, subdata, data.all, system),
                parseArgs(script.args, args),
            ];
        }
    }

    // Script requires a config
    if (script.reqConfig) {
        return [
            parseConfig(config, data),
            parseParams(script.args, params),
        ];
    }

    // The config is invalid
    Output.exit("The config is invalid");
    return [];
}

/**
 * Parses the Params
 * @param {Array} args
 * @param {Array} params
 * @returns {Object}
 */
function parseParams(args, params) {
    const result = { rest : "", values : [] };
    const argsv  = args.filter((arg) => !arg.startsWith("--"));
    let   index  = 0;

    for (const param of params) {
        if (param.startsWith("--")) {
            result[param.substr(2)] = true;
        } else if (argsv[index]) {
            result[argsv[index]] = param;
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
 * @param {Object=} alldata
 * @param {String=} system
 * @returns {Object}
 */
function parseConfig(config, data, alldata, system) {
    let result = {};
    if (Array.isArray(data)) {
        result = { ...config, data };
    } else if (alldata) {
        result = { ...config, ...alldata, ...data };
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
 * @param {Object} args
 * @returns {String}
 */
function getReactEnv(args) {
    let result = "";
    if (args.dev) {
        result = "env-cmd -f .env.dev ";
    } else if (args.stage) {
        result = "env-cmd -f .env.stage ";
    } else if (args.prod) {
        result = "";
    }
    return result;
}

/**
 * Returns the Flutter file depending on the arguments
 * @param {Object} args
 * @returns {String}
 */
function getFlutterFile(args) {
    let result = "Local";
    if (args.dev) {
        result = "Dev";
    } else if (args.stage) {
        result = "Stage";
    } else if (args.prod) {
        result = "Prod";
    }
    return result;
}

/**
 * Returns the Cordova env depending on the arguments
 * @param {Object} args
 * @returns {String}
 */
function getCordovaEnv(args) {
    return args.stage ? ".env.app.stage" : ".env.app.production";
}



// The public API
module.exports = {
    parse,
    getUrl,
    getReactEnv,
    getFlutterFile,
    getCordovaEnv,
};
