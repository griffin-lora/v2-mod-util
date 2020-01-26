const fs = require("fs")
const parser = require("./parser")
const Province = require("./Province")
const Country = require("./Country")

function clamp(num, min, max) {
    if (num < min) {
        num = min
    } else if (num > max) {
        num = max
    }
    return num
}

module.exports = class Mod {
    constructor(name, path) {
        this.name = name
        this.path = path
        this.definitionString = fs.readFileSync(`${path}/map/definition.csv`).toString()
        this.definitions = parser.parseCSV(this.definitionString, ";", "int", "int", "int", "int")
        this.countryDefinitionString = fs.readFileSync(`${path}/common/countries.txt`).toString()
        this.countryDefinitions = parser.parseBespoke(this.countryDefinitionString)
        this.mapPath = `${path}/map/provinces.bmp`
        this.provincesPath = `${path}/history/provinces`
        this.provinces = []
        this.countries = []
        for (let [tag, countryPathContainer] of Object.entries(this.countryDefinitions)) {
            const countryPath = countryPathContainer[0]
            if (fs.existsSync(`${path}/common/${countryPath}`)) {
                const countryDataString = fs.readFileSync(`${path}/common/${countryPath}`).toString()
                const country = new Country(tag, `${path}/common/${countryPath}`, parser.parseBespoke(countryDataString))
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
                const province = new Province(provinceId, `${this.provincesPath}/${provinceFolderPath}/${provincePath}`, parser.parseBespoke(provinceString), provinceColor)
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
    modifyMapData() {
        
    }
    save() {
        for (let i = 0; i < this.provinces.length; i++) {
            const province = this.provinces[i]
            fs.writeFileSync(province.path, parser.toBespoke(province.data))
        }
        for (let i = 0; i < this.countries.length; i++) {
            const country = this.countries[i]
            fs.writeFileSync(country.path, parser.toBespoke(country.data))
        }
    }
}