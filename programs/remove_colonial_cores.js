const { terminal } = require("terminal-kit")

module.exports = function(commandLine, tag) {
    return new Promise(resolve => {
        if (commandLine.environment.mod) {
            const provinces = commandLine.environment.mod.provinces
            for (let i = 0; i < provinces.length; i++) {
                const province = provinces[i]
                if (province.data.owner) {
                    const owner = province.data.owner[0]
                    if (tag) {
                        if (tag == owner && commandLine.environment.mod.isCore(province, owner)) {
                            delete province.data["colonial"] // second time ive ever used delete
                        }
                    } else if (commandLine.environment.mod.isCore(province, owner)) {
                        delete province.data["colonial"] // third time ive ever used delete
                    }
                }
            }
            resolve(`Mod ${commandLine.environment.mod.name} had the colonial status removed from cores.`)
        } else {
            terminal.red(`No mod is loaded`)
            resolve()
        }
    })
}