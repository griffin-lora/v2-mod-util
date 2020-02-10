module.exports = {
    parseBespoke: function(bespokeString) {
        const tokenSet = []
        const ignoreIndices = []
        for (let i = 0; i < bespokeString.length; i++) {
            if (ignoreIndices.indexOf(i) == -1 && !this.isBlankCharacter(bespokeString[i])) {
                let isComment = false
                let startedQuotationMark = false
                let gotEqualsSign = false
                let gotFirstCharacterPastEqualsSign = false
                let gotFirstBlankCharacter = false
                let gotEndOfAssignmentSign = false
                let gotEndBracket = false
                let endIndex
                for (let j = i; j < bespokeString.length; j++) {
                    const character = bespokeString[j]
                    if (character == "#") {
                        isComment = true
                    }
                    if (isComment) {
                        if (character == "\n") {
                            gotEndOfAssignmentSign = true
                            endIndex = j
                            for (let k = i + 1; k <= endIndex; k++) {
                                ignoreIndices.push(k)
                            }
                            break
                        }
                    } else {
                        if (!startedQuotationMark && this.isQuotationMark(character)) {
                            startedQuotationMark = true
                        } else if (startedQuotationMark && this.isQuotationMark(character)) {
                            startedQuotationMark = false
                        }
                        if (!startedQuotationMark) {
                            if (character == "}") {
                                gotEndBracket = true
                                gotEndOfAssignmentSign = true
                                endIndex = j - 1
                                for (let k = i + 1; k <= endIndex + 1; k++) {
                                    ignoreIndices.push(k)
                                }
                                break
                            }
                            if (!gotEndOfAssignmentSign) {
                                if (!gotEqualsSign && !gotFirstBlankCharacter && this.isBlankCharacter(character)) {
                                    gotFirstBlankCharacter = true
                                }
                                if (character != "=" && !gotEqualsSign && gotFirstBlankCharacter && !this.isBlankCharacter(bespokeString[j + 1]) && bespokeString[j + 1] != "=") {
                                    gotEndOfAssignmentSign = true
                                    endIndex = j
                                    for (let k = i + 1; k <= endIndex; k++) {
                                        ignoreIndices.push(k)
                                    }
                                    break
                                }
                                if (character == "=") {
                                    gotEqualsSign = true
                                } else if (gotEqualsSign && !this.isBlankCharacter(character)) {
                                    gotFirstCharacterPastEqualsSign = true
                                }
                                if (gotEqualsSign && gotFirstCharacterPastEqualsSign && (this.isBlankCharacter(character) || character == "{" || !bespokeString[j + 1])) {
                                    gotEndOfAssignmentSign = true
                                    endIndex = j
                                    for (let k = i + 1; k <= endIndex; k++) {
                                        ignoreIndices.push(k)
                                    }
                                    break
                                }
                            }
                        }
                    }
                }
                if (!isComment) {
                    let startedQuotationMarkOnAssignment = false
                    let assignment = ""
                    for (let j = i; j <= endIndex; j++) {
                        const character = bespokeString[j]
                        if (!startedQuotationMarkOnAssignment && this.isQuotationMark(character)) {
                            startedQuotationMarkOnAssignment = true
                        } else if (startedQuotationMarkOnAssignment && this.isQuotationMark(character)) {
                            startedQuotationMarkOnAssignment = false
                        }
                        if (!this.isQuotationMark(character) && (startedQuotationMarkOnAssignment || !this.isBlankCharacter(character))) {
                            assignment = assignment + bespokeString[j]
                        }
                    }
                    if (!assignment.length == 0) {
                        if (assignment.includes("=")) {
                            tokenSet.push(assignment.split("="))
                        } else {
                            tokenSet.push([assignment])
                        }
                    }
                    if (gotEndBracket) {
                        tokenSet.push(["}"])
                    }
                }
            }
        }
        return this.parseBespokeTokenSet(tokenSet)
    },
    isBlankCharacter: function(character) {
        return /\s/.test(character)
    },
    isQuotationMark: function(character) {
        return character == "\""
    },
    parseBespokeTokenSet(tokenSet, searchingFor) {
        let setType = false
        let isArray
        let output
        const ignoreIndices = []
        for (let i = 0; i < tokenSet.length; i++) {
            if (ignoreIndices.indexOf(i) == -1) {
                const tokens = tokenSet[i]
                if (tokens != null) {
                    const key = tokens[0]
                    const value = tokens[1]
                    if (!setType) {
                        if (key && key != "{" && !value) {
                            setType = true
                            isArray = true
                            output = []
                        } else {
                            setType = true
                            isArray = false
                            output = {}
                        }
                    }
                    if (searchingFor && key == searchingFor) {
                        return [output, i]
                    } 
                    if (!isArray) {
                        if (value == "{") {
                            const remainingTokenSet = []
                            for (let j = i + 1; j < tokenSet.length; j++) {
                                remainingTokenSet.push(tokenSet[j])
                            }
                            const data = this.parseBespokeTokenSet(remainingTokenSet, "}")
                            const value = data[0]
                            const indexStop = data[1] + i + 1
                            for (let j = i; j <= indexStop; j++) {
                                ignoreIndices.push(j)
                            }
                            if (!output[key]) {
                                output[key] = []
                            }
                            output[key].push(value)
                        } else {
                            if (!output[key]) {
                                output[key] = []
                            }
                            output[key].push(value)
                        }
                    } else {
                        output.push(key)
                    }
                }
            }
        }
        return output
    },
    toBespoke: function(bespokeObject, level) {
        if (!level) {
            level = 0
        }
        let output = ""
        for (let [key, values] of Object.entries(bespokeObject)) {
            for (let i = 0; i < values.length; i++) {
                const value = values[i]
                if (value) {
                    let valueString
                    if (Array.isArray(value)) {
                        valueString = "{ "
                        for (let j = 0; j < value.length; j++) {
                            if (typeof(value[j]) == "string" && value[j].includes(" ")) {
                                valueString += "\"" + value[j] + "\" "
                            } else {
                                valueString += value[j] + " "
                            }
                        }
                        valueString += "}"
                    } else if (typeof(value) == "object") {
                        valueString = "{\n" + this.toBespoke(value, level + 1) + `${"\t".repeat(level)}}`
                    } else {
                        if (typeof(value) == "string" && value.includes(" ")) {
                            valueString = "\"" + value + "\""
                        } else {
                            valueString = value
                        }
                    }
                    if (value) {
                        output = output + `${"\t".repeat(level)}${key} = ${valueString}\n`
                    }
                }
            }
        }
        return output
    }
}