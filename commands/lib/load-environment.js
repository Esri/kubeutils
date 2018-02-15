/* Copyright (c) 2018 Environmental Systems Research Institute, Inc.
 * Apache-2.0 */

const yaml = require('js-yaml')
const fs = require('fs')
const path = require('path')

module.exports = function (env) {
  const defaultYaml = fs.readFileSync(path.join(process.cwd(), 'defaults.yaml'))
  const defaults = yaml.safeLoad(defaultYaml)
  const environmentsYaml = fs.readFileSync(path.join(process.cwd(), 'environments.yaml'))
  const environments = yaml.safeLoad(environmentsYaml)
  const environment = environments[env]
  return Object.assign(defaults, environment, { env })
}
