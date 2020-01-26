const { terminal } = require("terminal-kit")
const fs = require("fs")
const bmp = require("bmp-js")

module.exports = function(commandLine, coreIndex, ...args) {
    return new Promise(resolve => {
        const path = [...args].join(" ")
        if (coreIndex && commandLine.environment.mod && path && fs.existsSync(path)) {
            coreIndex = parseInt(coreIndex) - 1
            const mod = commandLine.environment.mod
            const provinceData = bmp.decode(fs.readFileSync(mod.mapPath))
            const provincePixelData = provinceData.data
            const data = bmp.decode(fs.readFileSync(path))
            const pixelData = data.data
            const handledProvinces = []
            for (let i = 0; i < pixelData.length; i += 4) {
                let provinceRed = provincePixelData[i + 3]
                let provinceGreen = provincePixelData[i + 2]
                let provinceBlue = provincePixelData[i + 1]
                let red = pixelData[i + 3]
                let green = pixelData[i + 2]
                let blue = pixelData[i + 1]
                if (red != 0 && green != 0 && blue != 0) {
                    const province = mod.getProvinceFromColor([provinceRed, provinceGreen, provinceBlue])
                    if (province && !handledProvinces[province.id]) {
                        if (red == 128 && green == 128 && blue == 128) {
                            mod.setProvinceCore(province, coreIndex)
                        } else {
                            const country = mod.getCountryFromColor([red, green, blue])
                            if (country) {
                                mod.setProvinceCore(province, coreIndex, country.tag)
                            } else {
                                mod.setProvinceCore(province, coreIndex)
                            }
                        }
                        handledProvinces[province.id] = true
                    }
                }
            }
            resolve(`Done modifying provinces`)
        } else {
            terminal.red(`No mod is loaded or no path was provided`)
            resolve()
        }
    })
}