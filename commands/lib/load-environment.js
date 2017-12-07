const yaml = require('js-yaml')
const fs = require('fs')
const path = require('path')

module.exports = function (env) {
  const defaultYaml = fs.readFileSync(path.join(__dirname, '../../defaults.yaml'))
  const defaults = yaml.safeLoad(defaultYaml)
  const environmentsYaml = fs.readFileSync(path.join(__dirname, '../../environments.yaml'))
  const environments = yaml.safeLoad(environmentsYaml)
  const environment = environments[env]
  return Object.assign(defaults, environment, { env })
}
