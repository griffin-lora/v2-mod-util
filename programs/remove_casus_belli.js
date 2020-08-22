const { terminal } = require("terminal-kit")
const fs = require("fs")
const Bespoke = require("../Bespoke")

module.exports = function(commandLine) {
    return new Promise(resolve => {
        if (commandLine.environment.mod) {
            if (arguments.length >= 1) {
                const mod = commandLine.environment.mod
                const path = mod.path
                const cbsText = fs.readFileSync(`${path}/common/cb_types.txt`).toString()
                const cbs = Bespoke.parseBespoke(cbsText)
                for (let i = 1; i < arguments.length; i++) {
                    const casusBelli = cbs[arguments[i]][0]
                    if (casusBelli.can_use) {
                        const canUse = casusBelli.can_use[0]
                        if (!canUse.tag) {
                            canUse.tag = []
                        }
                        if (!canUse.NOT) {
                            canUse.NOT = []
                        }
                        canUse.tag.push("AUS")
                        canUse.NOT.push({ tag: ["AUS"] })
                    }
                }
                fs.writeFileSync(`${path}/common/cb_types.txt`, Bespoke.toBespoke(cbs))
                resolve(`Removed casus belli ${arguments}`)
            } else {
                terminal.red(`Invalid casus belli`)
                resolve()
            }
        } else {
            terminal.red(`No mod is loaded`)
            resolve()
        }
    })
}