const Input   = require("../utils/input");
const Output  = require("../utils/output");
const Command = require("../utils/command");
const Build   = require("../utils/build");

const FS      = require("fs");
const Path    = require("path");



/**
 * Runs the Version script
 * @param {object} config
 * @param {object} args
 * @returns {Promise}
 */
async function run(config, args) {
    Output.line();

    // Set the Build
    if (args.command === "set") {
        setBuild(config);
        return true;
    }

    // Restore the Build
    if (args.command === "restore") {
        restoreBuild(config);
        return true;
    }


    // Calculate the New Version
    // Command is [ "major", "minor", "patch", "build" ]
    let version = { old : "", new : "" };
    let build   = { old : "", new : "" };
    if (!config.parent) {
        [ version, build ] = await update(config, args);
    } else {
        [ version, build ] = await set(config, args);
    }

    // Save the New Version
    saveVersion(args, config, version, build);

    return true;
}

/**
 * Updates the Version
 * @param {object} config
 * @returns {Promise.<{old: String, new: String}[]>}
 */
async function update(config, args) {
    if (!config.version) {
        Output.exit("The version is required");
    }
    // An app counts builds and a library does not, so one is not asked for
    if (config.build === undefined || config.build === null) {
        config.build = "";
    }
    if (!args.command) {
        Output.bold(`The current version is ${config.version}`);
    }

    const command = await Input.valueOrChoice(args.command, "command", [ "major", "minor", "patch", "build" ]);
    const parts   = config.version.split(".");
    const amount  = args.undo ? -1 : 1;
    const build   = { old : config.build, new : config.build };

    switch (command) {
    case "major":
        parts[0] = Number(parts[0]) + amount;
        parts[1] = 0;
        parts[2] = 0;
        break;
    case "minor":
        parts[1] = Number(parts[1]) + amount;
        parts[2] = 0;
        break;
    case "patch":
        parts[2] = Number(parts[2]) + amount;
        break;
    case "build":
        build.new = Number(build.new) + amount;
        break;
    default:
        Output.exit("Invalid type");
    }

    const version = { old : config.version, new : parts.join(".") };
    Output.tab(command, `${withBuild(version.old, build.old)} -> ${withBuild(version.new, build.new)}`);

    return [ version, build ];
}

/**
 * Sets the Version
 * @param {object} config
 * @returns {object[]}
 */
function set(config, args) {
    const configPath = Path.resolve(process.cwd(), config.parent, "runner.json");
    const configFile = FS.readFileSync(configPath);
    const configData = JSON.parse(configFile.toString());

    const version    = { old : config.version, new : configData.version };
    const build      = { old : config.build,   new : config.build       };
    const amount     = args.undo ? -1 : 1;

    if (args.command === "build") {
        build.new = Number(build.new) + amount;
    }
    if (version.old !== version.new || build.old !== build.new) {
        Output.tab(args.command || "set", `${version.old}-${build.old} -> ${version.new}-${build.new}`);
    } else {
        Output.tab("version", `${version.new}-${build.new}`);
    }

    return [ version, build ];
}



/**
 * Sets the Build from 0
 * @param {object} config
 * @returns {void}
 */
function setBuild(config) {
    const version = { old : config.version, new : config.version };
    const build   = { old : "0",            new : config.build   };

    saveAllChanges(config, version, build);
}

/**
 * Restore the Build to 0
 * @param {object} config
 * @returns {void}
 */
function restoreBuild(config) {
    if (!config.isTemp) {
        return;
    }
    const version = { old : config.version, new : config.version };
    const build   = { old : config.build,   new : "0"            };

    saveAllChanges(config, version, build);
}

/**
 * Saves the Version
 * @param {object}                     args
 * @param {object}                     config
 * @param {{old: String, new: String}} version
 * @param {{old: String, new: String}} build
 * @returns {boolean}
 */
function saveVersion(args, config, version, build) {
    if (version.old === version.new && build.old === build.new) {
        return false;
    }
    saveConfig(version, build);

    if (config.isTemp) {
        build.old = "0";
        if (args.command !== "build") {
            build.new = "0";
        }
    }
    saveAllChanges(config, version, build);
    return true;
}

/**
 * Saves the Version in the Config
 * @param {{old: String, new: String}} version
 * @param {{old: String, new: String}} build
 * @returns {void}
 */
function saveConfig(version, build) {
    const isVersionChange = version.new !== version.old;
    const hasBuildFile    = Build.hasBuildFile();

    // The live Build goes to the shared Build file when there is one
    if (hasBuildFile) {
        Build.writeBuild(build.new);
    }

    // The runner.json Build only changes with the version, so a deploy does not modify it
    if (hasBuildFile && !isVersionChange) {
        return;
    }

    const configPath = Path.resolve(process.cwd(), "runner.json");
    const configFile = FS.readFileSync(configPath);
    const configData = JSON.parse(configFile.toString());

    configData.version = version.new;
    if (build.new !== "") {
        configData.build = build.new;
    }
    FS.writeFileSync(configPath, JSON.stringify(configData, null, 4));
}

/**
 * Saves the Version in the Files
 * @param {object}                     config
 * @param {{old: String, new: String}} version
 * @param {{old: String, new: String}} build
 * @returns {void}
 */
function saveAllChanges(config, version, build) {
    if (!config.changes) {
        return;
    }

    if (config.changes.length) {
        for (const change of config.changes) {
            saveChange(change, version, build);
        }
    } else {
        saveChange(config.changes, version, build);
    }
}

/**
 * Saves the Version in the Change
 * @param {object}                     change
 * @param {{old: String, new: String}} version
 * @param {{old: String, new: String}} build
 * @returns {void}
 */
function saveChange(change, version, build) {
    const ov  = withBuild(version.old, build.old);
    const nv  = withBuild(version.new, build.new);
    const ovp = `${version.old}+${build.old}`;
    const nvp = `${version.new}+${build.new}`;
    const ovc = `${version.old.replace(".", "")}${build.old}`;
    const nvc = `${version.new.replace(".", "")}${build.new}`;

    Command.pushdIf(change);
    switch (change.type) {
    case "file":
        Command.replace(ov, nv, change.file);
        break;
    case "env":
        Command.replace(ov, nv, ".env");
        break;
    case "node":
        // A version standing on its own is not unique in a lock file, where every
        // dependency has one of its own, so only the ones of the package are moved
        replaceInJSON(ov, nv, "package.json");
        replaceInJSON(ov, nv, "package-lock.json");
        break;
    case "flutter":
        Command.replace(ov,  nv,  "lib/data/AppConfig.dart");
        Command.replace(ovp, nvp, "pubspec.yaml");
        // Command.pushd("ios");
        // Command.exec(`agvtool new-marketing-version ${version.new} > /dev/null`);
        // Command.exec(`agvtool new-version -all ${build.new} > /dev/null`);
        // Command.popd();
        break;
    case "cordova":
        Command.replace(`version="${version.old}"`, `version="${version.new}"`, "config.xml");
        if (change.useCode) {
            Command.replace(`android-versionCode="${ovc}"`, `android-versionCode="${nvc}"`, "config.xml");
        } else {
            Command.replace(`android-versionCode="${build.old}"`, `android-versionCode="${build.new}"`, "config.xml");
        }
        Command.replace(`ios-CFBundleVersion="${build.old}"`, `ios-CFBundleVersion="${build.new}"`, "config.xml");
        break;
    }
    Command.popdIf(change);
}



/**
 * Returns the Version with the Build after it, when there is one
 * @param {string} version
 * @param {string|number} build
 * @returns {string}
 */
function withBuild(version, build) {
    return build === "" || build === undefined ? version : `${version}-${build}`;
}

/**
 * Replaces the Version a JSON file records for the package itself, and no other
 * @param {string} oldVersion
 * @param {string} newVersion
 * @param {string} file
 * @returns {void}
 */
function replaceInJSON(oldVersion, newVersion, file) {
    if (!FS.existsSync(file)) {
        return;
    }

    const search   = new RegExp(`"version"(\\s*):(\\s*)"${oldVersion}"`, "g");
    const target   = `"version"$1:$2"${newVersion}"`;
    const contents = FS.readFileSync(file).toString();

    // A lock file writes the version of the package twice, at the top and in the
    // package standing for the project, and then once per dependency under it
    const cutoff   = contents.indexOf('"node_modules/');
    const replaced = cutoff === -1
        ? contents.replace(search, target)
        : contents.slice(0, cutoff).replace(search, target) + contents.slice(cutoff);

    if (replaced !== contents) {
        FS.writeFileSync(file, replaced);
    }
}



// The public API
module.exports = run;
