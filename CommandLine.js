const { terminal } = require("terminal-kit")

const programs = {
    help: require("./programs/help"),
    open_mod: require("./programs/open_mod"),
    save_mod: require("./programs/save_mod"),
    set_province_owner: require("./programs/set_province_owner"),
    set_province_core: require("./programs/set_province_core"),
    set_province_owner_map: require("./programs/set_province_owner_map"),
    set_province_core_map: require("./programs/set_province_core_map"),
    get_province_data: require("./programs/get_province_data"),
    create_mod: require("./programs/create_mod"),
    create_province_owner_map: require("./programs/create_province_owner_map"),
    create_province_core_map: require("./programs/create_province_core_map"),
}

module.exports = class CommandLine {
    constructor() {
        this.environment = {}
        this.isRunningCommand = false
        this.ranCommandIndex = 0
        this.ranCommands = []
        this.requestInput()
        terminal.on("key", name => {
            if (!this.isRunningCommand) {
                if (name == "UP") {
                    if (this.ranCommandIndex > 0) {
                        this.ranCommandIndex--
                    }
                } else if (name == "DOWN") {
                    if (this.ranCommandIndex < this.ranCommandIndex) {
                        this.ranCommandIndex++
                    }
                }
            }
        })
    }
    requestInput() {
        return new Promise(resolve => {
            terminal("> ")
            terminal.inputField((_, input) => {
                this.isRunningCommand = true
                this.ranCommands.push(input)
                this.ranCommandIndex = this.ranCommands.length
                terminal("\n")
                const split = input.split(" ")
                const params = []
                for (let i = 1; i < split.length; i++) {
                    params.push(split[i])
                }
                this.execute(split[0], ...params).then((...args) => {
                    terminal(...args + "\n")
                    resolve(...args)
                    this.isRunningCommand = false
                    this.requestInput()
                })
            })
        })
    }
    execute(program, ...args) {
        if (programs[program]) {
            try {
                return programs[program](this, ...args)
            } catch(err) {
                terminal.red(err + "\n")
                return new Promise((resolve) => {
                    resolve()
                })
            }
        } else {
            terminal.red(`The program ${program} does not exist.`)
            return new Promise((resolve) => {
                resolve()
            })
        }
    }
}