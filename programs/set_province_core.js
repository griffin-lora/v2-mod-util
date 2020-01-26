const { terminal } = require("terminal-kit")

module.exports = function(commandLine, provinceId, coreIndex, tag) {
    return new Promise(resolve => {
        if (commandLine.environment.mod) {
            if (coreIndex && parseInt(coreIndex) && parseInt(provinceId) && commandLine.environment.mod.getProvince(parseInt(provinceId))) {
                coreIndex = parseInt(coreIndex) + 1
                const province = commandLine.environment.mod.getProvince(parseInt(provinceId))
                commandLine.environment.mod.setProvinceCore(province, coreIndex, tag)
                resolve(`Province core on ${coreIndex} was set to ${tag ? tag : "no one"}`)
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