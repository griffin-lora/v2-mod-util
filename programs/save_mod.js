const Mod = require("../Mod")
const fs = require("fs")
const { terminal } = require("terminal-kit")

module.exports = function(commandLine) {
    return new Promise(resolve => {
        if (commandLine.environment.mod) {
            commandLine.environment.mod.save()
            resolve(`Mod ${commandLine.environment.mod.name} was successfully saved`)
        } else {
            terminal.red(`No mod is loaded`)
            resolve()
        }
    })
}