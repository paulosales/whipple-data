const { program } = require("commander")
const convertAction = require("./convert-action")
const pkg = require("../package.json")

program
  .version(pkg.version)
  .arguments("<parametersFile>")
  .description(pkg.description)
  .action(convertAction)

program.parse(process.argv)
