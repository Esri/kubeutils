/* Copyright (c) 2018 Environmental Systems Research Institute, Inc.
 * Apache-2.0 */

const kops = require('./kops')
const kubectl = require('./kubectl')
const loadResources = require('./load-resources')

module.exports = { kops, kubectl, loadResources }
