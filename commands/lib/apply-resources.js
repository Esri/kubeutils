const { compact } = require('lodash')
const kubectl = require('../../kubectl')

module.exports = async function (resources, options) {
  const operations = compact(
    resources.map(resource => {
      if (['PodDisruptionBudget', 'ConfigMap'].includes(resource.kind)) {
        return {resource, args: { ...options, force: true }}
      } else if (resource.kind === 'CronJob') {
        return {resource, args: { ...options, validate: false }}
      } else {
        return {resource, args: options}
      }
    })
  )
  let results = []
  for (const operation of operations) {
    const {resource, args} = operation
    results.push(await kubectl.apply(resource, args))
  }
  return results
}
