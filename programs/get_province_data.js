const { terminal } = require("terminal-kit")

module.exports = function(commandLine, provinceId) {
    return new Promise(resolve => {
        if (commandLine.environment.mod) {
            if (parseInt(provinceId) && commandLine.environment.mod.getProvince(parseInt(provinceId))) {
                const province = commandLine.environment.mod.getProvince(parseInt(provinceId))
                resolve(`Province data:
path: ${province.path}
${province.data.owner ? `owner: ${province.data.owner[0]}` : ``}
${province.data.add_core ? `cores: ${province.data.add_core.join(", ")}` : ``}
`)
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