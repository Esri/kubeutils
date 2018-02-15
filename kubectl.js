/* Copyright (c) 2018 Environmental Systems Research Institute, Inc.
 * Apache-2.0 */

const { spawn } = require('child_process')
const chalk = require('chalk')
const delay = require('delay')

async function createNamespace (name, options = {}) {
  const args = ['create', 'namespace', name, '-o', 'json', ...optionalArgs(options)]
  return exec(args)
}

async function apply (resource, options = {}) {
  const args = ['apply', '-f', '-', '-o', 'json', ...optionalArgs(options)]
  return exec(args, resource)
}

async function config (command, options = {}) {
  let args
  if (command === 'set-context') {
    args = [
      'config',
      command,
      options.cluster,
      ...optionalArgs({ cluster: options.cluster, user: options.user })
    ] // we send --cluster and --user
  } else if (command === 'set-cluster') {
    args = [
      'config',
      command,
      options.cluster,
      ...optionalArgs({ server: options.server }) // we send --server
    ]
  } else if (command === 'use-context') {
    args = ['config', command, options.cluster] // no args required for this one
  }
  return exec(args, null, { logOutput: true })
}

async function rollout (deploymentName, command, options = {}) {
  const args = ['rollout', command, 'deployment', deploymentName, ...optionalArgs(options)]
  return exec(args, null, { logOutput: true })
}

async function del (type, name, options = {}) {
  const args = ['delete', type, name, ...optionalArgs(options)]
  return exec(args)
}

async function get (type, name, options = {}) {
  // remove undefined args to allow type to be passed in without a name
  const args = ['get', type, name, '-o', 'json', ...optionalArgs(options)].filter(arg => {
    return !!arg
  })
  return exec(args)
}

async function context () {
  const args = ['config', 'current-context']
  const response = await exec(args)
  return response.split('\n')[0]
}

async function waitFor (type, name, options = {}, elapsed = 0) {
  const limit = options.limit || 60000
  const timeout = options.timeout || 3000
  try {
    const resources = await get(type, name, options)
    if (!options.allowEmpty && resources.items && resources.items.length < 1) {
      throw new Error(`No resources of ${type} found`)
    }
  } catch (e) {
    let waitingFor = `type=${type}`
    if (name) waitingFor = `${waitingFor} name=${name}`
    console.log(
      chalk.yellow(
        `status=waiting ${waitingFor} elapsed=${elapsed} limit=${limit} timeout=${timeout}`
      )
    )
    if (elapsed > limit) {
      throw new Error('Timeout expired')
    } else {
      await delay(timeout)
      elapsed += timeout
      waitFor(type, name, options, elapsed)
    }
  }
}

function optionalArgs (options) {
  let args = []
  if (options.namespace) args = [...args, '-n', options.namespace]
  if (options.force) args = [...args, '--force=true']
  if (options.dryRun) args = [...args, '--dry-run=true']
  if (options.kubeconfig) args = [...args, '--kubeconfig', options.kubeconfig]
  if (options.server) args = [...args, '--server', options.server]
  if (options) if (options.token) args = [...args, '--token', options.token]
  if (options.cluster) args = [...args, '--cluster', options.cluster]
  if (options.user) args = [...args, '--user', options.user]
  // typeof check here because validate defaults to true
  if (typeof options.validate !== 'undefined') args = [...args, `--validate=${options.validate}`]
  return args
}

function exec (args = [], resource, options = {}) {
  if (process.env.DEBUG) console.log('kubectl args = ' + args)
  if (process.env.DEBUG) console.log('kubectl options = ' + JSON.stringify(options, null, 2))
  return new Promise((resolve, reject) => {
    const kubectl = spawn('/usr/local/bin/kubectl', args)
    const stdout = []
    const stderr = []
    kubectl.stdout.on('data', d => {
      if (options.logOutput) console.log(d.toString())
      else stdout.push(d)
    })
    kubectl.stderr.on('data', d => {
      if (options.logOutput) console.log(d.toString())
      else stderr.push(d)
    })

    if (resource) {
      if (typeof resource !== 'string') {
        resource = JSON.stringify(resource)
      }
      kubectl.stdin.write(resource)
      kubectl.stdin.end()
    }

    kubectl.on('close', code => {
      if (code !== 0) {
        const error = Buffer.concat(stderr).toString()
        return reject(new Error(error))
      } else {
        const output = Buffer.concat(stdout).toString()
        if (args.includes('json')) {
          handleJsonOuput(output, resolve, reject)
        } else {
          resolve(output)
        }
      }
    })
  })
}

function handleJsonOuput (output, resolve, reject) {
  try {
    const json = JSON.parse(output)
    resolve(json)
  } catch (e) {
    const match = output.match(/(\w+) ("[^\s]+") unchanged/i)
    if (match) {
      resolve({
        kind: match[1],
        metadata: {
          name: match[2]
        },
        unchanged: true
      })
    } else {
      reject(e)
    }
  }
}

module.exports = {
  apply,
  get,
  waitFor,
  del,
  createNamespace,
  context,
  rollout,
  config
}
