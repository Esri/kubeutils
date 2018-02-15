/* Copyright (c) 2018 Environmental Systems Research Institute, Inc.
 * Apache-2.0 */

module.exports = function (applies) {
  const loggables = applies.map(a => {
    const status = a.unchanged ? 'unchanged' : 'configured'
    return `status=${status} kind=${a.kind} name=${a.metadata.name}`
  })
  console.log(loggables.join('\n'))
}
