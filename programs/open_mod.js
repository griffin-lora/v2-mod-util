const Mod = require("../Mod")
const fs = require("fs")
const { terminal } = require("terminal-kit")

module.exports = function(commandLine, ...args) {
    return new Promise(resolve => {
        const modName = [...args].join(" ")
        if (modName && fs.existsSync(`C:/Program Files (x86)/Steam/steamapps/common/Victoria 2/mod/${modName}`)) {
            commandLine.environment.mod = new Mod(modName, `C:/Program Files (x86)/Steam/steamapps/common/Victoria 2/mod/${modName}`)
            resolve(`Mod ${modName} successfully loaded. Mod details:
province count: ${commandLine.environment.mod.provinces.length}
country count: ${commandLine.environment.mod.countries.length}
            `)
        } else {
            terminal.red(`Mod ${modName} does not exist`)
            resolve()
        }
    })
}