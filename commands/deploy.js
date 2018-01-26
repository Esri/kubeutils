const { loadEnvironment, logApplies, kubecfg } = require('./lib')
const { loadResources, kubectl } = require('../')

async function execute (options) {
  // options has certificate-authority-data, cluster, env, tag, user (oidc user)
  if (options.cluster) {
    options.server = `https://api.${options.cluster}` // we need this to add to kubecfg if there is a new cluster
  }
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

  const dryRunApplies = await applyResources(resources, {
    env: options.env,
    tag: options.tag,
    dryRun: true
  })

  if (options.dryRun) {
    logApplies(dryRunApplies)
    process.exit(0)
  }

  const applies = await applyResources(resources, { env: options.env, tag: options.tag })
  logApplies(applies)

  await Promise.all(
    deployments.map(d => {
      return kubectl.rollout(d, 'status', { namespace: options.env })
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
