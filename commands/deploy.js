const { loadEnvironment, logApplies, kubecfg } = require('./lib')
const { loadResources, kubectl } = require('../')

async function execute (options) {
  // options has token, certificate-authority-data, cluster, env, tag
  options.server = `https://api.${options.cluster}` // we need this to add to kubecfg if there is a new cluster
  const environment = loadEnvironment(options.env)
  const resources = await loadResources('k8s', { ...environment, ...options })

  if (options['certificate-authority-data']) {
    await kubecfg.write(options)
  }
  const deployments = resources
    .filter(r => {
      return r.kind === 'Deployment'
    })
    .map(d => {
      return d.metadata.name
    })

  delete options.cluster
  delete options['certificate-authority-data']
  delete options.server
  console.log('dry run of deployment')
  const dryApplies = await applyResources(resources, { ...options, dryRun: true })
  logApplies(dryApplies)

  console.log('the real deal')
  const applies = await applyResources(resources, options)
  logApplies(applies)

  console.log('checking rollout status')
  await Promise.all(
    deployments.map(d => {
      return kubectl.rollout(d, 'status', { ...options, namespace: options.env })
    })
  )
}

function applyResources (resources, options) {
  return Promise.all(
    resources.map(r => {
      return kubectl.apply(r, options)
    })
  )
}

module.exports = execute
