/* Copyright (c) 2018 Environmental Systems Research Institute, Inc.
 * Apache-2.0 */

const { applyResources, loadEnvironment, logApplies } = require('./lib')
const { loadResources } = require('../')

async function execute (options) {
  const environment = loadEnvironment(options.env)
  // options.file is a relative path, options.vars have template variables' values to be used in resources
  const resources = await loadResources(options.file, { ...environment, ...options, ...options.vars })

  if (options.dryRun) {
    const dryRunApplies = await applyResources(resources, {
      env: options.env,
      dryRun: true
    })
    logApplies(dryRunApplies)
    process.exit(0)
  }

  const applies = await applyResources(resources, { env: options.env })
  logApplies(applies)
}

module.exports = execute
