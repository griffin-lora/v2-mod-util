const { terminal } = require("terminal-kit")
const Bespoke = require("../Bespoke")
const fs = require("fs")
const { count } = require("console")

const countryCommonSchema = Bespoke.parseBespoke(`
color = { 0 0 0 }
graphical_culture = FrenchGC
party = {
	name = default_conservative
	start_date = 1800.1.1
	end_date = 2000.1.1
	ideology = conservative
	social_policy = no_position_set
	economic_policy = interventionism
	trade_policy = protectionism
	religious_policy = moralism
	citizenship_policy = limited_citizenship
	war_policy = pro_military
}
party = {
	name = default_liberal
	start_date = 1800.1.1
	end_date = 2000.1.1
	ideology = liberal
	social_policy = no_position_set
	economic_policy = laissez_faire
	trade_policy = free_trade
	religious_policy = moralism
	citizenship_policy = full_citizenship
	war_policy = anti_military
}
party = {
	name = default_reactionary
	start_date = 1800.1.1
	end_date = 2000.1.1
	ideology = reactionary
	social_policy = no_position_set
	economic_policy = state_capitalism
	trade_policy = protectionism
	religious_policy = moralism
	citizenship_policy = residency
	war_policy = jingoism
}
unit_names = {
	dreadnought = {  }
	battleship = {  }
	manowar = {  }
	cruiser = {  }
	frigate = {  }
	monitor = {  }
	clipper_transport = { }
	steam_transport = { }
	commerce_raider = {  }
}
`)

const countryHistorySchema = Bespoke.parseBespoke(`
capital = 1
primary_culture = french
religion = catholic
government = absolute_monarchy
plurality = 0
nationalvalue = nv_order
literacy = 0.50
non_state_culture_literacy = 0.01
civilized = yes

ruling_party = default_conservative
last_election = 1834.6.21
upper_house = {
    fascist = 0
    liberal = 15
    conservative = 55
    reactionary = 30
    anarcho_liberal = 0
    socialist = 0
    communist = 0
}

govt_flag = {
    government = absolute_monarchy
    flag = theocracy
}

#schools = culture_tech_school
#decision = france_1836_setup

oob = "TAG_oob.txt"
`)

module.exports = function(commandLine, tag, r, g, b, graphicalCulture, primaryCulture, capital, religion, literacy, name, adjective) {
    return new Promise(resolve => {
        tag = tag.toUpperCase()
        if (commandLine.environment.mod) {
            const mod = commandLine.environment.mod
            const path = mod.path
            const tgaFlagPath = `${path}/TAG.tga`
            const countriesPath = `${path}/common/countries.txt`
            const countryCommonPath = `${path}/common/countries/${name}.txt`
            const countryHistoryPath = `${path}/history/countries/${tag} - ${name}.txt`
            const countryOobPath = `${path}/history/units/${tag}_oob.txt`
            const countryFlagsPath = `${path}/gfx/flags`
            const flagPath = `${countryFlagsPath}/${tag}.tga`
            const communistFlagPath = `${countryFlagsPath}/${tag}_communist.tga`
            const fascistFlagPath = `${countryFlagsPath}/${tag}_fascist.tga`
            const monarchyFlagPath = `${countryFlagsPath}/${tag}_monarchy.tga`
            const republicFlagPath = `${countryFlagsPath}/${tag}_republic.tga`
            const localizationPath = `${path}/localisation/modutil.csv`


            let countries = fs.readFileSync(countriesPath).toString()
            countries = `${tag} = "countries/${name}.txt"\n` + countries
            let localization = fs.readFileSync(localizationPath).toString()
            localization += `\n${tag};${name};;;;;;;;;;;;;\n`
            localization += `${tag}_ADJ;${adjective};;;;;;;;;;;;;`
            // WRITING
            fs.writeFileSync(countriesPath, countries)
            fs.writeFileSync(localizationPath, localization)

            const countryCommonData = JSON.parse(JSON.stringify(countryCommonSchema))
            const countryHistoryData = JSON.parse(JSON.stringify(countryHistorySchema))
            const color = countryCommonData.color[0]
            color[0] = r
            color[1] = g
            color[2] = b
            countryCommonData.graphical_culture[0] = graphicalCulture
            countryHistoryData.primary_culture[0] = primaryCulture
            countryHistoryData.capital[0] = capital
            countryHistoryData.religion[0] = religion
            countryHistoryData.literacy[0] = literacy
            countryHistoryData.oob[0] = `${tag}_oob.txt`
            const countryCommon = Bespoke.toBespoke(countryCommonData)
            const countryHistory = Bespoke.toBespoke(countryHistoryData)
            // WRITING
            fs.writeFileSync(countryCommonPath, countryCommon)
            fs.writeFileSync(countryHistoryPath, countryHistory)

            // MISC WRITING
            fs.writeFileSync(countryOobPath, "")
            fs.copyFileSync(tgaFlagPath, flagPath)
            fs.copyFileSync(tgaFlagPath, communistFlagPath)
            fs.copyFileSync(tgaFlagPath, fascistFlagPath)
            fs.copyFileSync(tgaFlagPath, monarchyFlagPath)
            fs.copyFileSync(tgaFlagPath, republicFlagPath)

            resolve("Done creating country")
            
        } else {
            terminal.red(`No mod is loaded`)
            resolve()
        }
    })
}