const { terminal } = require("terminal-kit")

module.exports = function() {
    return new Promise(resolve => {
        resolve(`
open_mod <mod name> Opens a mod.
save_mod Saves the currently opened mod.
set_province_owner <province id> <tag>|none Sets the province owner to the provided country tag or removes ownership if no country tag is provided.
set_province_core <province id> <layer> <tag>|none Sets the province core on the specified layer to the provided country tag or removes the core on the specified layer if no country tag is provided.
get_province_data <province id> Gets the data for the province.
`)
    })
}