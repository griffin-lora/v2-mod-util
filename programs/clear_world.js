const { terminal } = require("terminal-kit")

module.exports = function(commandLine) {
    return new Promise(resolve => {
        if (commandLine.environment.mod) {
            const mod = commandLine.environment.mod
            for (let i = 0; i < mod.provinces.length; i++) {
                const province = mod.provinces[i]
                mod.setProvinceOwner(province)
                if (province.data.add_core) {
                    province.data.add_core = []
                }
                province.cores = []
            }
            resolve(`Cleared the world`)
        } else {
            terminal.red(`No mod is loaded`)
            resolve()
        }
    })
}