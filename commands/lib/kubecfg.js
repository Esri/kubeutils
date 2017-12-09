const yaml = require('js-yaml')
const fs = require('fs')
const { kubectl } = require('../../')

async function write (options = {}) {
  await kubectl.config('set-cluster', options)
  await kubectl.config('set-context', options)
  await kubectl.config('use-context', options)
  let kubeconfigLocation
  if (process.env.KUBECONFIG) {
    kubeconfigLocation = process.env.KUBECONFIG
  } else {
    kubeconfigLocation = `${process.env.HOME}/.kube/config`
  }
  const kubeConfig = yaml.safeLoad(fs.readFileSync(kubeconfigLocation))
  kubeConfig.clusters.forEach((clusterObj, i) => {
    if (clusterObj.name === options.cluster) {
      clusterObj.cluster['certificate-authority-data'] = options['certificate-authority-data']
    }
  })
  fs.writeFileSync(kubeconfigLocation, yaml.safeDump(kubeConfig))
}

module.exports = {
  write: write
}
