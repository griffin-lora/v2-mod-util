const { terminal } = require("terminal-kit")

const programs = {
    help: true,
    open_mod: true,
    save_mod: true,
    set_province_owner: true,
    set_province_core: true,
    set_province_owner_map: true,
    set_province_core_map: true,
    get_province_data: true,
    create_mod: true,
    create_province_owner_map: true,
    create_province_core_map: true,
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
                return require(`./programs/${program}`)(this, ...args)
            } catch(err) {
                terminal.red(err + "\n")
            }
        } else {
            terminal.red(`The program ${program} does not exist.`)
            return new Promise((resolve) => {
                resolve()
            })
        }
    }
}