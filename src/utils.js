const fs = require("fs")
const parse = require("csv-parse/lib/sync")
const debug = require("debug")

const log = debug("whipple-data:utils:log")
log.log = console.log.bind(console)

const parseJsonFile = async (fileName) => {
  log("Parsing JSON file %s", fileName)
  if (!fs.existsSync(fileName)) {
    throw new Error(`The JSON file ${fileName} not founded.`)
  }

  const data = JSON.parse(await fs.promises.readFile(fileName))

  log("JSON file parsed.")

  return data
}

const parseCsvFile = async (fileName) => {
  log("Loading TRE data from file %s", fileName)
  const pollingData = await fs.promises.readFile(fileName, "utf8")

  const data = parse(pollingData, {
    columns: true,
    skip_empty_lines: true,
    delimiter: ";",
  })

  log("%d records loaded from tre file %s", data.length, fileName)

  return data
}

const savePollingStations = async (outputFile, pollingStations) => {
  log("Saving polling station data into file %s", outputFile)
  await fs.promises.writeFile(
    outputFile,
    JSON.stringify(pollingStations, null, 2)
  )
  log("%d records saved into file %s", pollingStations.length, outputFile)
}

module.exports = { parseJsonFile, parseCsvFile, savePollingStations }
