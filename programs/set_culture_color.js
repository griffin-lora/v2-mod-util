const { terminal } = require("terminal-kit")

module.exports = function(commandLine, culture, red, green, blue) {
    return new Promise(resolve => {
        if (commandLine.environment.mod) {
            if (culture && typeof(parseInt(red)) == "number" && typeof(parseInt(green)) == "number" && typeof(parseInt(blue)) == "number") {
                red = parseInt(red)
                green = parseInt(green)
                blue = parseInt(blue)
                commandLine.environment.mod.setCultureColor(culture, red, green, blue)
                resolve(`Set culture color`)
            } else {
                terminal.red(`Invalid arg`)
                resolve()
            }
        } else {
            terminal.red(`No mod is loaded`)
            resolve()
        }
    })
}