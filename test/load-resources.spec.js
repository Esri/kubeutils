const test = require('tape')
const loadResources = require('../load-resources')

test('load all resources w/ at least one template', async function (t) {
  t.plan(3)
  const resources = await loadResources('test/fixtures/namespaces/test', { minSize: 1, maxSize: 10, env: 'dev-east-1', clusterDomain: 'foo.bar.com' })
  t.equal(resources.length, 1, 'loaded correct number of resources')
  const resource = resources[0]
  t.equal(resource.kind, 'Deployment', 'loaded resource from template')
  const command = resource.spec.template.spec.containers[0].command
  t.equal(command[4], '--nodes=1:10:nodes.foo.bar.com', 'rendered values correctly')
})

test('load a list', async function (t) {
  t.plan(3)
  const resources = await loadResources('test/fixtures/namespaces/list', { env: 'dev-east-1', clusterDomain: 'foo.bar.com' })
  t.equal(resources.length, 2, 'broke up the list')
  const [ClusterRole, ClusterRoleBinding] = resources
  t.equal(ClusterRole.kind, 'ClusterRole', 'loaded second type correctly')
  t.equal(ClusterRoleBinding.kind, 'ClusterRoleBinding', 'loaded first type correctly')
})

test('load a specific file', async function (t) {
  t.plan(3)
  const resources = await loadResources('test/fixtures/namespaces/test/cluster-autoscaler.hbs', { minSize: 1, maxSize: 10, env: 'dev-east-1', clusterDomain: 'foo.bar.com' }, { rootIsSpecificFile: true })
  t.equal(resources.length, 1, 'loaded correct number of resources')
  const resource = resources[0]
  t.equal(resource.kind, 'Deployment', 'loaded resource from template')
  const command = resource.spec.template.spec.containers[0].command
  t.equal(command[4], '--nodes=1:10:nodes.foo.bar.com', 'rendered values correctly')
  t.end()
})
