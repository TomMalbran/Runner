const Input   = require("../utils/input");
const Output  = require("../utils/output");
const Command = require("../utils/command");
const Config  = require("../utils/config");

const Path    = require("path");



/**
 * Runs the Info script
 * @param {Object} config
 * @param {Object} args
 * @param {Object} env
 * @returns {Promise}
 */
async function run(config, args, env) {
    Output.title("Publishing the System");

    const platform = await Input.valueOrPrompt(args.platform, "platform");

    switch (config.type) {
    case "flutter":
        publishFlutter(config, args, env, platform);
        break;
    case "cordova":
        publishCordova(config, args, env, platform);
        break;
    default:
        Output.error("The type is invalid");
        return;
    }

    return true;
}

/**
 * Publishes a Flutter App
 * @param {Object} config
 * @param {Object} args
 * @param {String} platform
 * @returns {Void}
 */
function publishFlutter(config, args, env, platform) {
    Output.subtitle(`Publishing Flutter to ${platform}-${env.name}`);
    Output.date();
    Output.line();

    // Updates the Build
    Config.updateBuild(config, args);
    const file = Config.getFlutterFile(env);

    switch (platform) {
    case "android": {
        Output.step("Building the Android App");
        Command.pushdIf(config);
        if (args.clean) {
            Command.exec("flutter clean");
        }
        Command.execChild(`flutter build apk --release -t lib/main/${file}.dart --target-platform android-arm,android-arm64,android-x64 --split-per-abi --build-name=${config.version} --build-number=${config.build}`);
        Command.popdIf(config);
        Output.line();

        Output.step("Moving the apk Files");
        Command.move(`${config.path}/build/app/outputs/flutter-apk/app-armeabi-v7a-release.apk`, `release/${config.name}-armeabi-v7a.apk`);
        Command.move(`${config.path}/build/app/outputs/flutter-apk/app-arm64-v8a-release.apk`,   `release/${config.name}-arm64-v8a.apk`);
        Command.move(`${config.path}/build/app/outputs/flutter-apk/app-x86_64-release.apk`,      `release/${config.name}-x86_64.apk`);
        Output.text("Files moved!");
        Output.line();

        Output.step("Publish the App");
        Output.tab("Login", "https://play.google.com/apps/publish/");
        Output.tab("User ", config.user);
        break;
    }

    case "ios": {
        Command.cdIf(config.path);

        Output.step("Building the iOS App");
        Command.pushdIf(config);
        if (args.clean) {
            Command.exec("flutter clean");
        }
        Command.execChild(`flutter build ios --release -t lib/main/${file}.dart`);
        Output.line();

        Output.step("Creating the ipa File");
        Command.pushd("ios");
        const buildPath = Path.resolve(config.currentDir, config.path, "ios", "build");
        const result1   = Command.execSilent(`xcodebuild -workspace Runner.xcworkspace -scheme Runner -sdk iphoneos -configuration Release archive -archivePath ${buildPath}/Runner.xcarchive`);
        if (result1.includes("ARCHIVE SUCCEEDED")) {
            Output.text("Archive succeded!");
        } else {
            Output.text(result1);
        }
        const result2 = Command.execSilent(`xcodebuild -exportArchive -archivePath ${buildPath}/Runner.xcarchive -exportOptionsPlist exportOptions.plist -exportPath ${buildPath}/Runner.ipa -allowProvisioningUpdates`);
        if (result2.includes("EXPORT SUCCEEDED")) {
            Output.text("Export succeded!");
        } else {
            Output.text(result2);
        }
        Command.popd();
        Command.popdIf(config);
        Output.line();

        Output.step("Moving the ipa File");
        Command.move(`${buildPath}/Runner.ipa/${config.name}.ipa`, `release/${config.name}.ipa`);
        Output.text("File moved!");
        Output.line();

        Output.step("Uploading to TestFlight");
        const result3 = Command.execSilent(`xcrun altool --upload-app -f release/${config.name}.ipa -u ${config.user} -p ${config.pass} -t ios`);
        if (result3.includes("No errors uploading")) {
            Output.text(`No errors uploading release/${config.name}.ipa`);
        } else {
            Output.text(result3);
        }
        Output.line();

        Output.step("Publish the App");
        Output.tab("Login", "https://appstoreconnect.apple.com/");
        Output.tab("User ", config.user);
        break;
    }

    default:
        Output.exit("Invalid platform");
    }

    // Restore the Build
    Config.restoreBuild();
}

/**
 * Publishes a Cordova App
 * @param {Object} config
 * @param {Object} args
 * @param {Object} env
 * @param {String} platform
 * @returns {Void}
 */
function publishCordova(config, args, env, platform) {
    Output.subtitle(`Publishing Cordova to ${platform}-${env.name}`);
    Output.date();
    Output.line();

    // Updates the Build
    Config.updateBuild(config, args);

    Output.step("Building the React App");
    Command.execSilent(`runner build ${env.name}`);
    Output.line();

    switch (platform) {
    case "android": {
        Output.step("Building the Android App");
        Command.execChild("cordova build android --release --buildConfig");
        Command.move("platforms/android/app/build/outputs/apk/release/app-release.apk", `release/${config.name}.apk`);
        Output.line();

        Output.step("Publish the App");
        Output.tab("Login", "https://play.google.com/apps/publish/");
        Output.tab("User ", config.user);
        break;
    }

    case "ios": {
        Output.step("Building the iOS App");
        Command.execChild("cordova build ios --release --device --buildConfig");
        Command.move(`platforms/ios/build/device/${config.name}.ipa`, `release/${config.name}.ipa`);

        Output.step("Uploading to TestFlight");
        Command.exec(`xcrun altool --upload-app -f release/${config.name}.ipa -u ${config.user} -p ${config.pass}`);
        Output.line();

        Output.step("Publish the App");
        Output.tab("Login", "https://appstoreconnect.apple.com/");
        Output.tab("User ", config.user);
        break;
    }

    default:
        Output.exit("Invalid platform");
    }

    // Restore the Build
    Config.restoreBuild();
}



// The public API
module.exports = run;
