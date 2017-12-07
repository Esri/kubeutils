const { loadEnvironment } = require('./lib')
const { loadResources, kubectl } = require('kubeutils')

async function execute (options) {
  const environment = loadEnvironment(options.env)
  const resources = await loadResources('k8s', environment)

  console.log('dry run of deployment')
  await applyResources(resources, environment, options.tag, true)

  console.log('the real deal')
  await applyResources(resources, environment, options.tag, false)
}

function applyResources (resources, environment, tag, dryRun) {
  const options = { ...environment, tag }
  if (dryRun) options.dryRun = true
  return Promise.all(resources.map(r => {
    kubectl.apply(r, options)
  }))
}

module.exports = execute
