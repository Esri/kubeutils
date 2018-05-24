/* Copyright (c) 2018 Environmental Systems Research Institute, Inc.
 * Apache-2.0 */

const { loadEnvironment, logApplies } = require('./lib')
const { loadResources, kubectl } = require('../')

async function execute (options) {
  const environment = loadEnvironment(options.env)
  // options.file is a relative path
  const resources = await loadResources(options.file, { ...environment, ...options })

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

function applyResources (resources, options) {
  return Promise.all(
    resources.map(r => {
      return kubectl.apply(r, options)
    })
  )
}

module.exports = execute
