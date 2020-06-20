const fs = require("fs")
const Bespoke = require("./Bespoke")
const CSV = require("./CSV")
const Province = require("./Province")
const Country = require("./Country")
const Pop = require("./Pop")

function clamp(num, min, max) {
    if (num < min) {
        num = min
    } else if (num > max) {
        num = max
    }
    return num
}

const metadataSchema = {
    cultureColors: {}
}

module.exports = class Mod {
    constructor(name, path) {
        this.name = name
        this.path = path
        this.definitionString = fs.readFileSync(`${path}/map/definition.csv`).toString()
        this.definitions = CSV.parseCSV(this.definitionString, ";", "int", "int", "int", "int")
        this.countryDefinitionString = fs.readFileSync(`${path}/common/countries.txt`).toString()
        this.countryDefinitions = Bespoke.parseBespoke(this.countryDefinitionString)
        this.mapPath = `${path}/map/provinces.bmp`
        this.provincesPath = `${path}/history/provinces`
        this.popPath = `${path}/history/pops/1836.1.1`
        this.metadataPath = `${path}/mod_util_metadata.json`
        this.cultureColors = []
        this.provinces = []
        this.countries = []
        for (let [tag, countryPathContainer] of Object.entries(this.countryDefinitions)) {
            const countryPath = countryPathContainer[0]
            if (fs.existsSync(`${path}/common/${countryPath}`)) {
                const countryDataString = fs.readFileSync(`${path}/common/${countryPath}`).toString()
                const country = new Country(tag, `${path}/common/${countryPath}`, Bespoke.parseBespoke(countryDataString))
                this.countries.push(country)
            }
        }
        this.countryColorMap = []
        this.countryTagMap = {}
        for (let i = 0; i < this.countries.length; i++) {
            const country = this.countries[i]
            this.countryTagMap[country.tag] = country
            const color = this.findCountryColor(country)
            country.data.color[0] = color
            if (!this.countryColorMap[color[0]]) {
                this.countryColorMap[color[0]] = []
            }
            if (!this.countryColorMap[color[0]][color[1]]) {
                this.countryColorMap[color[0]][color[1]] = []
            }
            this.countryColorMap[color[0]][color[1]][color[2]] = country
        }

        const provinceFolderPaths = fs.readdirSync(this.provincesPath)
        for (let i = 0; i < provinceFolderPaths.length; i++) {
            const provinceFolderPath = provinceFolderPaths[i]
            const provincePaths = fs.readdirSync(`${this.provincesPath}/${provinceFolderPath}`)
            for (let j = 0; j < provincePaths.length; j++) {
                const provincePath = provincePaths[j]
                const provinceId = parseInt(provincePath.match(/\d+/g))
                const provinceString = fs.readFileSync(`${this.provincesPath}/${provinceFolderPath}/${provincePath}`).toString()
                let provinceColor = []
                for (let i = 0; i < this.definitions.length; i++) {
                    const definition = this.definitions[i]
                    if (definition[0] == provinceId) {
                        provinceColor = [definition[1], definition[2], definition[3]]
                        break
                    }
                }
                const province = new Province(provinceId, `${this.provincesPath}/${provinceFolderPath}/${provincePath}`, Bespoke.parseBespoke(provinceString), provinceColor)
                province.country = this.getCountryFromProvince(province)
                if (province.data.add_core) {
                    for (let i = 0; i < province.data.add_core.length; i++) {
                        const coreTag = province.data.add_core[i]
                        province.cores.push(this.countryTagMap[coreTag])
                    }
                }
                this.provinces.push(province)
            }
        }

        this.provinceColorMap = []
        for (let i = 0; i < this.provinces.length; i++) {
            const province = this.provinces[i]
            const color = province.color
            if (!this.provinceColorMap[color[0]]) {
                this.provinceColorMap[color[0]] = []
            }
            if (!this.provinceColorMap[color[0]][color[1]]) {
                this.provinceColorMap[color[0]][color[1]] = []
            }
            this.provinceColorMap[color[0]][color[1]][color[2]] = province
        }

        this.popGroupPathMap = {}
        const popFilePaths = fs.readdirSync(this.popPath)
        for (let i = 0; i < popFilePaths.length; i++) {
            const popFilePath = popFilePaths[i]
            const popString = fs.readFileSync(`${this.popPath}/${popFilePath}`).toString()
            this.popGroupPathMap[popFilePath] = popString
        }

        this.popPathProvinceMap = []
        const popGroupPathMapEntries = Object.entries(this.popGroupPathMap)
        for (let i = 0; i < this.provinces.length; i++) {
            const province = this.provinces[i]
            let shouldBreak = false
            for (let [ popPath, popGroup ] of popGroupPathMapEntries) {
                const popGroupLines = popGroup.match(/[^\r\n]+/g)
                for (let j = 0; j < popGroupLines.length; j++) {
                    const line = popGroupLines[j]
                    if (line == `${province.id} = {`) {
                        this.popPathProvinceMap[province.id] = popPath
                        shouldBreak = true
                        break
                    }
                }
                if (shouldBreak) {
                    break
                }
            }
        }

        if (!fs.existsSync(this.metadataPath)) {
            fs.writeFileSync(this.metadataPath, JSON.stringify(metadataSchema))
        }
        this.metadata = JSON.parse(fs.readFileSync(this.metadataPath).toString())
    }
    findCountryColor(country, inp) {
        if (country.data.color[0][0]) {
            let color = country.data.color[0]
            color = [parseInt(color[0]), parseInt(color[1]), parseInt(color[2])]
            if (!this.getCountryFromColor(color)) {
                return color
            } else {
                country.data.color[0] = [clamp(color[0] + 1, 0, 255), clamp(color[1] - 1, 0, 255), clamp(color[2] - 2, 0, 255)]
                return this.findCountryColor(country)
            }
        } else {
            return country.data.color[0]
        }
    }
    getProvince(provinceId) {
        for (let i = 0; i < this.provinces.length; i++) {
            const province = this.provinces[i]
            if (province.id == provinceId) {
                return province
            }
        }
    }
    getCountryFromProvince(province) {
        if (!province.data.owner) {
            return
        }
        return this.countryTagMap[province.data.owner[0]]
    }
    setProvinceOwner(province, tag) {
        if (tag) {
            province.data.owner = [tag]
            province.data.controller = [tag]
            province.country = this.getCountryFromProvince(province)
        } else {
            delete province.data.owner
            delete province.data.controller
            province.country = undefined
        }
    }
    setProvinceCore(province, index, tag) {
        if (!province.data.add_core) {
            province.data.add_core = []
        }
        province.data.add_core[index] = tag
        province.cores[index] = this.countryTagMap[tag]
    }
    getProvinceFromColor(color) {
        const colorMap0 = this.provinceColorMap[color[0]]
        if (colorMap0) {
            const colorMap1 = colorMap0[color[1]]
            if (colorMap1) {
                return colorMap1[color[2]]
            }
        }
    }
    getCountryFromColor(color) {
        const colorMap0 = this.countryColorMap[color[0]]
        if (colorMap0) {
            const colorMap1 = colorMap0[color[1]]
            if (colorMap1) {
                return colorMap1[color[2]]
            }
        }
    }
    isCore(province, tag) {
        const cores = province.data.add_core
        if (cores) {
            for (let i = 0; i < cores.length; i++) {
                const coreTag = cores[i]
                if (coreTag == tag) {
                    return true
                }
            }
        }
        return false
    }
    save() {
        for (let i = 0; i < this.provinces.length; i++) {
            const province = this.provinces[i]
            const bespokeString = Bespoke.toBespoke(province.data, [ "owner", "controller" ])
            fs.writeFileSync(province.path, bespokeString)
        }
        for (let i = 0; i < this.countries.length; i++) {
            const country = this.countries[i]
            fs.writeFileSync(country.path, Bespoke.toBespoke(country.data))
        }
        const popGroupPathMapEntries = Object.entries(this.popGroupPathMap)
        for (let [ popPath, popGroup ] of popGroupPathMapEntries) {
            fs.writeFileSync(`${this.popPath}/${popPath}`, popGroup)
        }
        fs.writeFileSync(this.metadataPath, JSON.stringify(this.metadata))
    }
    parseCultureString(cultureString) {
        const culturePercentages = []
        const culturePercentageStrings = cultureString.split(",")
        for (let i = 0; i < culturePercentageStrings.length; i++) {
            const culturePercentageString = culturePercentageStrings[i]
            const [ percentage, culture ] = culturePercentageString.split("%")
            culturePercentages.push([ percentage / 100, culture ])
        }
        return culturePercentages
    }
    setProvinceCultures(province, cultures) {
        const provinceId = province.id
        const popPath = this.popPathProvinceMap[provinceId]
        const popGroup = this.popGroupPathMap[popPath]
        const popGroupData = Bespoke.parseBespoke(popGroup)
        for (let [ popProvinceId, popsDataContainer ] of Object.entries(popGroupData)) {
            if (parseInt(popProvinceId) == provinceId) {
                const popsData = popsDataContainer[0]
                const pops = []
                for (let [ popType, popsOfSameType ] of Object.entries(popsData)) {
                    for (let i = 0; i < popsOfSameType.length; i++) {
                        const popData = popsOfSameType[i]
                        const pop = new Pop(popType, popData)
                        pops.push(pop)
                    }
                }
                let startIndex = 0
                for (let i = 0; i < cultures.length; i++) {
                    const [ percentage, culture ] = cultures[i]
                    const popCount = Math.round(percentage * pops.length)
                    for (let j = startIndex; j < (startIndex + popCount); j++) {
                        const pop = pops[j]
                        if (pop) {
                            pop.data.culture[0] = culture
                        }
                    }
                    startIndex = (startIndex + popCount)
                }
                break
            }
        }
        this.popGroupPathMap[popPath] = Bespoke.toBespoke(popGroupData)
    }
    setCultureColor(cultureString, red, green, blue) {
        const cultureColors = this.metadata.cultureColors
        red = red.toString()
        green = green.toString()
        blue = blue.toString()

        if (!cultureColors[red]) {
            cultureColors[red] = {}
        }
        if (!cultureColors[red][green]) {
            cultureColors[red][green] = {}
        }
        cultureColors[red][green][blue] = this.parseCultureString(cultureString)
    }
    getCultureFromColor(red, green, blue) {
        red = red.toString()
        green = green.toString()
        blue = blue.toString()
        const cultureColors = this.metadata.cultureColors
        if (cultureColors[red]) {
            if (cultureColors[red][green]) {
                return cultureColors[red][green][blue]
            }
        }
    }
}