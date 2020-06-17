const { terminal } = require("terminal-kit")
const fs = require("fs")

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
    remove_ahd: require("./programs/remove_ahd"),
    toggle_external: require("./programs/toggle_external")
}

module.exports = class CommandLine {
    constructor() {
        this.externalExecution = false
        this.environment = {}
        this.isRunningCommand = false
        this.ranCommands = []
        this.requestInput()
    }
    requestInput() {
        return new Promise(resolve => {
            terminal("> ")
            terminal.inputField({ history: this.ranCommands }, (_, input) => {
                this.isRunningCommand = true
                this.ranCommands.push(input)
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
            if (fs.existsSync("programs")) {
                if (fs.existsSync(`programs/${program}.js`)) {
                    if (this.externalExecution) {
                        return require(`programs/${program}`)(this, ...args)
                    } else {
                        terminal.red(`External execution could be dangerous. Toggle external execution via the toggle_external command.`)
                        return new Promise((resolve) => {
                            resolve()
                        })
                    }
                } else {
                    terminal.red(`The command ${program} does not exist.`)
                    return new Promise((resolve) => {
                        resolve()
                    })
                }
            } else {
                terminal.red(`The command ${program} does not exist.`)
                return new Promise((resolve) => {
                    resolve()
                })
            }
        }
    }
}