const { terminal } = require("terminal-kit")
const fs = require("fs")
const bmp = require("bmp-js")

function getPixelIndexAtLocation(location, data) {
    const rowStart = data.width * location[1]
    return rowStart + location[0]
}

function isPixelDifferent(data, pixelIndex, checkPixelIndex) {
    let red = data[(pixelIndex * 4) + 3]
    let green = data[(pixelIndex * 4) + 2]
    let blue = data[(pixelIndex * 4) + 1]
    let checkRed = data[(checkPixelIndex * 4) + 3]
    let checkGreen = data[(checkPixelIndex * 4) + 2]
    let checkBlue = data[(checkPixelIndex * 4) + 1]
    return red != checkRed || green != checkGreen || blue != checkBlue
}

module.exports = function(commandLine, ...args) {
    return new Promise(resolve => {
        const path = [...args].join(" ")
        if (path && !fs.existsSync(path) && commandLine.environment.mod) {
            const mod = commandLine.environment.mod
            const provinceData = bmp.decode(fs.readFileSync(mod.mapPath))
            const provincePixelData = provinceData.data
            const data = bmp.decode(bmp.encode(provinceData).data)
            const pixelData = data.data
            for (let i = 0; i < pixelData.length; i += 4) {
                const pixelIndex = i / 4
                const pixelLocation = [pixelIndex - (Math.floor(pixelIndex / provinceData.width) * provinceData.width), Math.floor(pixelIndex / provinceData.width)]

                let red = pixelData[i + 3]
                let green = pixelData[i + 2]
                let blue = pixelData[i + 1]

                if (isPixelDifferent(provincePixelData, pixelIndex, getPixelIndexAtLocation([pixelLocation[0] + 1, pixelLocation[1]], provinceData))
                || isPixelDifferent(provincePixelData, pixelIndex, getPixelIndexAtLocation([pixelLocation[0] - 1, pixelLocation[1]], provinceData))
                || isPixelDifferent(provincePixelData, pixelIndex, getPixelIndexAtLocation([pixelLocation[0], pixelLocation[1] + 1], provinceData))
                || isPixelDifferent(provincePixelData, pixelIndex, getPixelIndexAtLocation([pixelLocation[0], pixelLocation[1] - 1], provinceData))) {
                    red = 0
                    green = 0
                    blue = 0
                } else {
                    const province = mod.getProvinceFromColor([red, green, blue])
                    if (province) {
                        red = 128
                        green = 128
                        blue = 128
                    } else {
                        red = 20
                        green = 52
                        blue = 107
                    }
                }
                pixelData[i + 3] = red
                pixelData[i + 2] = green
                pixelData[i + 1] = blue
            }
            const imageData = bmp.encode(data)
            fs.writeFileSync(path, imageData.data)
            resolve(`Done creating province map`)
        } else {
            terminal.red(`No mod is loaded or no output path was provided.`)
            resolve()
        }
    })
}