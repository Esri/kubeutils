module.exports = function (applies) {
  const loggables = applies.map(a => {
    const status = a.unchanged ? 'unchanged' : 'configured'
    return `status=${status} kind=${a.kind} name=${a.metadata.name}`
  })
  console.log(loggables.join('\n'))
}
