const fs = require("fs");
const path = require("path");

const config = require("./config.json");
const profiles = require("./profiles.json");

const basic = parseIni(fs.readFileSync(path.join(config.templateDir, "basic.ini"), "utf-8"));
const recordEncoder = JSON.parse(fs.readFileSync(path.join(config.templateDir, "recordEncoder.json"), "utf-8"));
const streamEncoder = JSON.parse(fs.readFileSync(path.join(config.templateDir, "streamEncoder.json"), "utf-8"));

Object.entries(profiles).forEach(([name, settings]) => {
    const createdProfile = {
        basic: replace(basic, settings.basic || { }),
        recordEncoder: replace(recordEncoder, settings.recordEncoder || { }),
        streamEncoder: replace(streamEncoder, settings.streamEncoder || { })
    }

    createdProfile.basic.General.Name = name;
    
    const dirName = name.replace(/ /g, "_");
    const dirPath = path.join(config.savePath, dirName);
    const basicPath = path.join(dirPath, "basic.ini");
    const recordEncoderPath = path.join(dirPath, "recordEncoder.json");
    const streamEncoderPath = path.join(dirPath, "streamEncoder.json");
    
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath);

    if (fs.existsSync(basicPath)) renameFile(basicPath, `${basicPath}.bak`);
    if (fs.existsSync(recordEncoderPath)) renameFile(recordEncoderPath, `${recordEncoderPath}.bak`);
    if (fs.existsSync(streamEncoderPath)) renameFile(streamEncoderPath, `${streamEncoderPath}.bak`);

    fs.writeFileSync(basicPath, stringifyIni(createdProfile.basic));
    fs.writeFileSync(recordEncoderPath, JSON.stringify(createdProfile.recordEncoder));
    fs.writeFileSync(streamEncoderPath, JSON.stringify(createdProfile.streamEncoder));

    console.log(`Profile '${name}' created and saved at '${dirPath}'`);
});

function parseIni(ini) {
    const parsed = { };
    let objKey;
    ini.split("\n").filter(i => i && !i.startsWith(";")).forEach(line => {
        const objKeyMatch = line.match(/\[(.*?)\]$/);
        if (objKeyMatch) {
            objKey = objKeyMatch[1];
            return parsed[objKey] = { };
        }
        if (!objKey) throw new Error();
        if (!line.includes("=")) return;
        const [key, value] = line.split("=");
        parsed[objKey][key] = value;
    });
    return parsed;
}

function stringifyIni(json) {
    let parsed = "";
    Object.entries(json).forEach(([key, value]) => {
        parsed += `[${key}]\n`;
        Object.entries(value).forEach(([key, value]) => {
            parsed += `${key}=${value}\n`;
        });
        parsed += "\n"
    });
    return parsed;
}

function renameFile(filePath, newPath) {
    if (fs.existsSync(newPath)) fs.rmSync(newPath);
    fs.renameSync(filePath, newPath);
}

function replace(source, replacement) {
    Object.entries(replacement).forEach(([key, value]) => {
        if (typeof value != "object" || (typeof source[key] != "object" && typeof value == "object")) return source[key] = value;
        return source[key] = replace(source[key], value);
    });
    return source;
}