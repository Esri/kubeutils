const walk = require('walk-sync')
const path = require('path')
const yaml = require('js-yaml')
const { flattenDeep, compact, flatten } = require('lodash')
const util = require('util')
const fs = require('fs')
const read = util.promisify(fs.readFile)
const handlebars = require('handlebars')

async function loadResources (root, values = {}, options = {}) {
  const manifest = buildManifest(root, options)

  const strings = await Promise.all(
    manifest.map(file => {
      if (path.extname(file) === '.hbs') {
        return read(file, {}).then(contents => {
          const render = handlebars.compile(contents.toString())
          return render(values)
        })
      } else {
        return read(file, {})
      }
    })
  )
  let yamls = compact(flatten(strings.map(yaml.safeLoadAll)))
  yamls = yamls.map(yaml => {
    if (yaml.kind === 'List') return yaml.items
    else return yaml
  })

  return compact(flattenDeep(yamls))
}

function buildManifest (root, options) {
  const globs = options.globs || ['**/*.yaml', '**/*.hbs']
  return walk(path.join(process.cwd(), root), { directories: false, globs }).map(file => {
    return path.join(root, file)
  })
}

module.exports = loadResources
