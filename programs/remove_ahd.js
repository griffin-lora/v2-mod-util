const { terminal } = require("terminal-kit")

module.exports = function(commandLine) {
    return new Promise(resolve => {
        if (commandLine.environment.mod) {
            const provinces = commandLine.environment.mod.provinces
            for (let i = 0; i < provinces.length; i++) {
                const province = provinces[i]
                delete province.data["1861.1.1"] // first time ive ever used delete
            }
            resolve(`Mod ${commandLine.environment.mod.name} had the 1861.1.1 dates removed from provinces.`)
        } else {
            terminal.red(`No mod is loaded`)
            resolve()
        }
    })
}