const fs = require("fs-extra")
const { terminal } = require("terminal-kit")

function copy(folder, modName) {
    terminal(`Copying ${folder} into mod ${modName}\n`)
    fs.copySync(`C:/Program Files (x86)/Steam/steamapps/common/Victoria 2/${folder}`, `C:/Program Files (x86)/Steam/steamapps/common/Victoria 2/mod/${modName}/${folder}`)
    terminal(`Copied ${folder} into mod ${modName}\n`)
}

module.exports = function(commandLine, modName) {
    return new Promise(resolve => {
        if (modName && modName.length > 0 && !fs.existsSync(`C:/Program Files (x86)/Steam/steamapps/common/Victoria 2/mod/${modName}`)) {
            fs.mkdirSync(`C:/Program Files (x86)/Steam/steamapps/common/Victoria 2/mod/${modName}`)
            fs.writeFileSync(`C:/Program Files (x86)/Steam/steamapps/common/Victoria 2/mod/${modName}.mod`, `name = "${modName}"
path = "mod/${modName}"
user_dir = "${modName}"`)
            copy("battleplans", modName)
            copy("common", modName)
            copy("decisions", modName)
            copy("events", modName)
            // copy("gfx", modName)
            copy("history", modName)
            copy("interface", modName)
            copy("inventions", modName)
            copy("localisation", modName)
            copy("map", modName)
            copy("news", modName)
            copy("poptypes", modName)
            copy("technologies", modName)
            copy("units", modName)
            resolve(`Created mod ${modName}`)
        } else {
            terminal.red("Invalid mod name or mod already exists")
            resolve(``)
        }
    })
}