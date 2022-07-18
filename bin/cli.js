#! /usr/bin/env node
const pkg = require('../package.json')
const cmd = require('commander')
const COMMANDMAP = {
  init: require('../lib/create.js'),
}

function exec(command, ...args) {
  COMMANDMAP[command](...args)
}

cmd
  .version(pkg.version)
  .command('init <name>')
  .description('确认创建一个新项目吗？')
  // -f or --force 为强制创建，如果创建的目录存在则直接覆盖
  .option('-f, --force', '强制创建传入')
  .action((name, options) => exec('init', name, options))

cmd.version(pkg.version)
cmd.parse(process.argv)

if (!cmd.args.length) {
  cmd.help()
}
