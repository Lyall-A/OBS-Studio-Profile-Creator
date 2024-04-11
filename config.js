const os = require("os");
const path = require("path");

const obsProfilesPath = path.join(os.homedir(), "AppData", "Roaming", "obs-studio", "basic", "profiles");

module.exports = {
    templateDir: path.join(obsProfilesPath, "Main"),
    savePath: obsProfilesPath
}