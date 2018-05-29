function coerceKeyValues (vars) {
  return vars.reduce((obj, variable) => {
    const [key, value] = variable.split(/=(.+)/)
    obj[key] = value
    return obj
  }, {})
}

module.exports = {
  coerceKeyValues
}
