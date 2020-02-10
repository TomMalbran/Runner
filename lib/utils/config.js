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
            result[argsv[index]] = params;
            index += 1;
        }
        result.rest += `${param} `;
        result.values.push(param); 
    }
    return result;
}

/**
 * Parses the Arguments
 * @param {Array} args
 * @param {Array} params
 * @returns {Object}
 */
function parseArgs(args, params) {
    const others = parseParams(args, params.params);
    return { ...args, ...others };
}



/**
 * Parses the Config
 * @param {Object} script
 * @param {Object} data
 * @param {Object} params
 * @returns {Array}
 */
function parse(script, data, params) {
    if (script.reqConfig && !data) {
        Output.exit("The config is required");
        return [];
    }
    
    // Script requires no config, just return it empty
    if (!script.reqConfig) {
        return [ {}, parseParams(script.args, params) ];
    }

    // Script requires a type and there is one, return the data
    if (script.reqType && data.type) {
        return [ data, parseParams(script.args, params) ];
    }

    // Script has systems, try to get it
    if (script.hasSystem) {
        const args   = {};
        args.system  = await Input.valueOrPrompt(params[0], "system");
        args.params  = params.slice(1);
        const config = data[system];

        if (!config) {
            output.exit("The system doesn't exists");
            return [];
        }
        if (script.reqType && data.type) {
            return [ config, parseArgs(script.args, args) ];
        }
    }
    
    // The config is invalid
    Output.exit("The config is invalid");
    return [];
}



// The public API
module.exports = {
    parse,
};
