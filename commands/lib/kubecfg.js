const yaml = require('js-yaml')
const fs = require('fs')
const { kubectl } = require('../../')

async function write (options = {}) {
  /*
    options = {
      cluster: foo-bar.dev.koopernetes.com,
      certificate-authority-data: 'base64 encoded cert auth data'
    }
  */
  await kubectl.config('set-cluster', options)
  await kubectl.config('set-context', options)
  await kubectl.config('use-context', options)
  const kubeConfig = yaml.safeLoad(fs.readFileSync(`${process.env.HOME}/.kube/config`))
  kubeConfig.clusters.forEach((clusterObj, i) => {
    if (clusterObj.name === options.cluster) {
      clusterObj.cluster['certificate-authority-data'] = options['certificate-authority-data']
    }
  })
  console.log(kubeConfig)
  fs.writeFileSync(`${process.env.HOME}/.kube/config`, yaml.safeDump(kubeConfig))
}

module.exports = {
  write: write
}
