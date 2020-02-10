module.exports = {
    parseCSV: function(csvString, delimiter, ...args) {
        const lines = csvString.match(/[^\r\n]+/g)
        const output = []
        for (let i = 0; i < lines.length; i++) {
            if (i > 0) {
                const line = lines[i]
                const strings = line.split(delimiter)
                const outputLine = []
                for (let j = 0; j < strings.length; j++) {
                    if ([...args][j] == "int") {
                        outputLine.push(parseInt(strings[j]))
                    } else {
                        outputLine.push(strings[j])
                    }
                }
                output.push(outputLine)
            }
        }
        return output
    }
}