const { terminal } = require("terminal-kit")

module.exports = function() {
    return new Promise(resolve => {
        resolve(`
open_mod <mod name> Opens a mod.
save_mod Saves the currently opened mod.
set_province_owner <province id> <tag> Sets the province owner to the specified country or no country if no tag is specified.
set_province_core <province id> <layer> <tag> Sets the province core on the specified layer to the specified country or no country if no tag is specified.
get_province_data <province id> Gets the data for the province.
create_province_owner_map <output path> Creates a map of province ownership at the specified path.
create_province_core_map <layer> <output path> Creates a map of province cores on the specified layer at the specified path.
set_province_owner_map <input path> Sets province ownership to the province ownership specified in the input path.
set_province_core_map <layer> <input path> Sets province cores on the specified layer to the province cores specified in the input path.
`)
    })
}