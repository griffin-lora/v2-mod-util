const { terminal } = require("terminal-kit")

module.exports = function(commandLine) {
    return new Promise(resolve => {
        commandLine.externalExecution = !commandLine.externalExecution
        resolve(`External execution is now ${commandLine.externalExecution ? "on" : "off"}`)
    })
}