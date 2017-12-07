#!/usr/bin/env node

const commands = require('../commands')
const chalk = require('chalk')
const yargs = require('yargs')

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
  .help('help')
  .epilog('Made with ♥️  by Esri DC R&D')
  .wrap(100).argv

function deployOpts (yargs) {
  return yargs
    .describe('server', 'k8s api to deploy to')
    .describe('token', 'token for accessing the cluster')
    .describe('client-certificate', 'TLS certificate for the cluster')
    .describe('env', 'which hub environment to deploy to')
    .describe('tag', 'which tag to deploy')
    .choices('env', ['dev', 'qa', 'prod'])
}

function rollbackOpts (yargs) {
  return yargs
    .describe('server', 'k8s api of the cluster')
    .describe('token', 'token for accessing the cluster')
    .describe('client-certificate', 'TLS certificate for the cluster')
    .describe('env', 'which hub environment/namespace to rollback')
    .choices('env', ['dev', 'qa', 'prod'])
}

function handle (command) {
  return args => {
    command(args).catch(e => {
      console.error(chalk.redBright(e.stack))
      process.exit(1)
    })
  }
}
