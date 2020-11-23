const debug = require("debug")

const log = debug("whipple-data:polling-dataset:log")
log.log = console.log.bind(console)

function PollingStationDataset() {
  const pollingStationsMap = {}
  const distributedPollingStationsMap = {}

  this.get = (key) => pollingStationsMap[key]

  this.getPollingStations = () => {
    const pollingStation = []

    log("Ordering by zone and polling station number")
    const keys = Object.keys(pollingStationsMap).sort((pId1, pId2) => {
      const [p1Zone, p1Number] = pId1
        .split("-")
        .map((item) => Number.parseInt(item))
      const [p2Zone, p2Number] = pId2
        .split("-")
        .map((item) => Number.parseInt(item))

      const delta1 = p1Zone - p2Zone
      if (delta1 === 0) {
        return p1Number - p2Number
      } else {
        return delta1
      }
    })

    log("Creating polling stations array")
    for (let key of keys) {
      pollingStationsMap[key].distributedPollingStations =
        distributedPollingStationsMap[key]
      pollingStation.push(pollingStationsMap[key])
    }
    log("Polling stations array created")
    return pollingStation
  }

  this.loadTrePollingStationData = (trePollingStationData, year) => {
    log("Loading TRE data from election of %d...", year)
    for (let record of trePollingStationData) {
      const zone = Number.parseInt(record["ZONA"])
      const pollingStationNumber = Number.parseInt(record["SECAO_PRINCIPAL"])
      const key = `${zone}-${pollingStationNumber}`
      let pollingStation = pollingStationsMap[key]
      if (pollingStation === undefined) {
        pollingStation = convertTreRecordToPollingStation(record)
        pollingStationsMap[key] = pollingStation
      }
      pollingStation.elections.push(year)

      if (
        record["SECOES_DISTRIBUIDAS"] != null &&
        record["SECOES_DISTRIBUIDAS"].length > 0
      ) {
        const distributedPollingStations = record["SECOES_DISTRIBUIDAS"]
          .split(",")
          .map((distrPollingStationNumber) =>
            Number.parseInt(distrPollingStationNumber.trim())
          )
        distributedPollingStations.forEach((distrPollingStationNumber) => {
          const distributedKey = `${zone}-${distrPollingStationNumber}`

          const distrPollingStation =
            distributedPollingStationsMap[distributedKey]

          if (distrPollingStation === undefined) {
            distributedPollingStationsMap[distributedKey] = [
              pollingStationNumber,
            ]
          } else {
            distrPollingStation.push(pollingStationNumber)
          }
        })
      }
    }
    log(
      "%d records loaded from election of %d",
      trePollingStationData.length,
      year
    )
  }

  this.loadTreChangedZones = (changedZonesData) => {
    for (let record of changedZonesData) {
      const key = `${Number.parseInt(record["ZONA_ORIGEM"])}-${Number.parseInt(
        record["SECAO_ORIGEM"]
      )}`

      let pollingStation = pollingStationsMap[key]
      if (pollingStation === undefined) {
        pollingStation = convertTreLinkRecordToPollingStation(record)
        pollingStationsMap[key] = pollingStation
      }
      const newPollingStation = {
        zone: Number.parseInt(record["ZONA_DESTINO"]),
        pollingStationNumber: Number.parseInt(record["SECAO_DESTINO"]),
      }
      pollingStation["changedTo"] = newPollingStation
    }
  }

  const convertTreRecordToPollingStation = (treRecord) => {
    return {
      zone: Number.parseInt(treRecord["ZONA"]),
      pollingStationNumber: Number.parseInt(treRecord["SECAO_PRINCIPAL"]),
      place: treRecord["LOCAL"],
      address: treRecord["ENDERECO"],
      neighborhood: treRecord["BAIRRO"],
      city: treRecord["MUNICIPIO"],
      groupedPollingStations: [],
      distributedPollingStations: [],
      elections: [],
    }
  }

  const convertTreLinkRecordToPollingStation = (treRecord) => {
    return {
      zone: Number.parseInt(treRecord["ZONA_ORIGEM"]),
      pollingStationNumber: Number.parseInt(treRecord["SECAO_ORIGEM"]),
      place: treRecord["LOCAL_ORIGEM"],
      address: "",
      neighborhood: "",
      city: treRecord["MUNIC_ORIGEM"],
      groupedPollingStations: [],
      distributedPollingStations: [],
      elections: [],
    }
  }
}

module.exports = PollingStationDataset
