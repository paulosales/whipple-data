const path = require("path")
const debug = require("debug")
const PollingStationDataset = require("./polling-station-dataset")
const { parseCsvFile, parseJsonFile, savePollingStations } = require("./utils")

const error = debug("whipple-data:main")
const log = debug("whipple-data:main:log")
log.log = console.log.bind(console)

debug.enable("whipple-data:*")

const importFiles = async (parameters, basePath) => {
  const dataset = new PollingStationDataset()
  for (let file of parameters.pollingStationsFiles) {
    const fullFilename = path.resolve(basePath, file.name)
    const electionYear = file.electionYear
    const trePollingStationData = await parseCsvFile(fullFilename)
    dataset.loadTrePollingStationData(trePollingStationData, electionYear)
  }

  for (let file of parameters.changedZonesFiles) {
    const fullFilename = path.resolve(basePath, file)
    const changedZonesData = await parseCsvFile(fullFilename)
    dataset.loadTreChangedZones(changedZonesData)
  }

  return dataset
}

const convertAction = async (parametersFile) => {
  try {
    let parameters = await parseJsonFile(parametersFile)
    const dataset = await importFiles(parameters, path.dirname(parametersFile))
    const pollingStations = dataset.getPollingStations()
    const outputFile = path.resolve(
      path.dirname(__filename),
      "..",
      "dist",
      "polling-stations.json"
    )
    savePollingStations(outputFile, pollingStations)
  } catch (e) {
    error("Error: %s", e.message)
    error(e.stack)
  }
}

module.exports = convertAction
