const { terminal } = require("terminal-kit")

module.exports = function(commandLine, provinceId, tag) {
    return new Promise(resolve => {
        if (commandLine.environment.mod) {
            if (parseInt(provinceId) && commandLine.environment.mod.getProvince(parseInt(provinceId))) {
                const province = commandLine.environment.mod.getProvince(parseInt(provinceId))
                commandLine.environment.mod.setProvinceOwner(province, tag)
                resolve(`Province now belongs to ${tag ? tag : "no one"}`)
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