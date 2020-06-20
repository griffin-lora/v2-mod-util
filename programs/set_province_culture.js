const { terminal } = require("terminal-kit")

module.exports = function(commandLine, provinceId, cultureString) {
    return new Promise(resolve => {
        if (commandLine.environment.mod) {
            const mod = commandLine.environment.mod
            if (parseInt(provinceId) && mod.getProvince(parseInt(provinceId))) {
                const province = mod.getProvince(parseInt(provinceId))
                const cultures = mod.parseCultureString(cultureString)
                mod.setProvinceCultures(province, cultures)
                resolve(`Province now has its culture data changed to ${cultureString}`)
            } else {
                terminal.red(`Invalid province id`)
                resolve()
            }
        } else {
            terminal.red(`No mod is loaded`)
            resolve()
        }
    })
}