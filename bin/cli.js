#!/usr/bin/env node
/* Copyright (c) 2018 Environmental Systems Research Institute, Inc.
 * Apache-2.0 */

const commands = require('../commands')
const chalk = require('chalk')
const yargs = require('yargs')
const { coerceKeyValues } = require('./helper')

module.exports = yargs
  .command(
    'deploy',
    'deploys the application to a target cluster',
    deployOpts,
    handle(commands.deploy)
  )
  .command(
    'rollback',
    'rolls back the deployments on a target cluster',
    rollbackOpts,
    handle(commands.rollback)
  )
  .command(
    'apply',
    'runs the provided k8s yaml on a target cluster',
    applyOpts,
    handle(commands.apply)
  )
  .help('help')
  .epilog('Made with ♥️  by Esri DC R&D')
  .wrap(100).argv

function deployOpts (yargs) {
  return yargs
    .describe('cluster', 'cluster to deploy to')
    .describe('token', 'token for accessing the cluster')
    .describe('certificate-authority-data', 'cert auth data for the cluster')
    .describe('env', 'which  environment to deploy to')
    .describe('tag', 'which tag to deploy')
    .describe('dry-run', 'if true, do not actually apply')
}

function rollbackOpts (yargs) {
  return yargs
    .describe('server', 'k8s api of the cluster')
    .describe('token', 'token for accessing the cluster')
    .describe('certificate-authority-data', 'TLS certificate for the cluster')
    .describe('env', 'which hub environment/namespace to rollback')
    .choices('env', ['dev', 'qa', 'prod'])
}

function applyOpts (yargs) {
  return yargs
    .describe('file', 'relative path of a file to be run on a cluster')
    .alias('file', 'f')
    .describe('env', 'which  environment to apply to')
    .describe('dry-run', 'if true, do not actually apply')
    .describe('vars', 'any other vars you want to pass in as key=value to be used in the environment to be applied on resources')
    .array('vars')
    .coerce('vars', coerceKeyValues)
    .usage('bin/cli.js apply --file <file to be applied> --dry-run --env dev --vars tag=1234 placeholder="some placeholder value"')
}

function handle (command) {
  return args => {
    command(args).catch(e => {
      console.error(chalk.redBright(e.stack))
      process.exit(1)
    })
  }
}
