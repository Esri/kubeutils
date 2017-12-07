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
    console.log(chalk.yellow(`status=waiting ${waitingFor} elapsed=${elapsed} limit=${limit} timeout=${timeout}`))
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
  // typeof check here because validate defaults to true
  if (typeof options.validate !== 'undefined') args = [...args, `--validate=${options.validate}`]
  return args
}

function exec (args = [], resource) {
  if (process.env.DEBUG) console.log('kubectl args = ' + args)
  return new Promise((resolve, reject) => {
    const kubectl = spawn('/usr/local/bin/kubectl', args)
    const stdout = []
    const stderr = []
    kubectl.stdout.on('data', d => {
      stdout.push(d)
    })
    kubectl.stderr.on('data', d => {
      stderr.push(d)
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
  context
}
