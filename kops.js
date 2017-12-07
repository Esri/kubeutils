const { spawn } = require('child_process')

function loadClusterSpec (cluster) {
  return exec(['get', 'cluster', cluster, '-o', 'json'])
}

function exec (args = []) {
  return new Promise((resolve, reject) => {
    const kops = spawn('/usr/local/bin/kops', args)
    const data = []
    kops.stdout.on('data', d => {
      if (args.includes('json')) {
        data.push(d)
      } else {
        console.log(d.toString())
      }
    })
    kops.stderr.on('data', d => console.error(d.toString()))

    kops.on('close', code => {
      if (code !== 0) return reject(new Error(`Kops exited ${code}`))

      if (args.includes('json')) {
        const result = JSON.parse(Buffer.concat(data))
        resolve(result)
      } else {
        resolve()
      }
    })
  })
}

module.exports = {
  exec,
  loadClusterSpec
}
