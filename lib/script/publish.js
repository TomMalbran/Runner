const Input   = require("../utils/input");
const Output  = require("../utils/output");
const Command = require("../utils/command");
const Config  = require("../utils/config");
const Path    = require("path");



/**
 * Runs the Info script
 * @param {Object} config
 * @param {Object} args
 * @returns {Promise}
 */
async function run(config, args) {
    Output.title("Publishes the System");

    const platform = await Input.valueOrPrompt(args.platform, "platform");
        
    switch (config.type) {
    case "flutter":
        publishFlutter(config, args, platform);
        break;
    
    default:
        Output.error("The type is invalid");
        return;
    }

    Output.done();
}

/**
 * Publishes a Flutter App
 * @param {Object} config
 * @param {Object} args
 * @param {String} platform
 * @returns {Void}
 */
function publishFlutter(config, args, platform) {
    if (args.dev) {
        Output.subtitle(`Publishing Flutter to ${platform}-dev`);
    } else if (args.stage) {
        Output.subtitle(`Publishing Flutter to ${platform}-stage`);
    } else {
        Output.subtitle(`Publishing Flutter to ${platform}-prod`);
    }

    Output.step("Updating the Version");
    Command.execSilent("runner version build");
    Output.tab("Version", `${config.version}-${Number(config.build) + 1}`);
    Output.line();

    const file = Config.getFlutterFile(args);
    switch (platform) {
    case "android": {
        Output.step("Building the Android App");
        Command.pushdIf(config);
        Command.exec("flutter clean");
        Command.execChild(`flutter build apk --release -t lib/main/${file}.dart --target-platform android-arm,android-arm64,android-x64 --split-per-abi`);
        Command.popdIf(config);
        Output.line();
        
        Output.step("Moving the apk Files");
        Command.move(`${config.path}/build/app/outputs/apk/release/app-armeabi-v7a-release.apk`, `release/${config.name}-armeabi-v7a.apk`);
        Command.move(`${config.path}/build/app/outputs/apk/release/app-arm64-v8a-release.apk`,   `release/${config.name}-arm64-v8a.apk`);
        Command.move(`${config.path}/build/app/outputs/apk/release/app-x86_64-release.apk`,      `release/${config.name}-x86_64.apk`);
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
        Command.exec("flutter clean");
        Command.execChild(`flutter build ios --release -t lib/main/${file}.dart`);
        Output.line();
        
        Output.step("Creating the ipa File");
        Command.pushd("ios");
        const buildPath = Path.resolve(config.currentDir, config.path, "ios", "build");
        const result1   = Command.execSilent(`xcodebuild -workspace Runner.xcworkspace -scheme Runner -sdk iphoneos -configuration Release archive -archivePath ${buildPath}/Runner.xcarchive`);
        if (result1.includes("** ARCHIVE SUCCEEDED **")) {
            Output.text("** ARCHIVE SUCCEEDED **");
        } else {
            Output.text(result1);
        }
        const result2 = Command.execSilent(`xcodebuild -exportArchive -archivePath ${buildPath}/Runner.xcarchive -exportOptionsPlist exportOptions.plist -exportPath ${buildPath}/Runner.ipa -allowProvisioningUpdates`);
        if (result2.includes("** EXPORT SUCCEEDED **")) {
            Output.text("** EXPORT SUCCEEDED **");
        } else {
            Output.text(result2);
        }
        Command.popd();
        Command.popdIf(config);
        Output.line();

        Output.step("Moving the ipa File");
        Command.move(`${buildPath}/Runner.ipa/Runner.ipa`, `release/${config.name}.ipa`);
        Output.line();

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
}



// The public API
module.exports = run;
