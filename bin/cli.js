#! /usr/bin/env node

const program = require('commander')
const versionCode = require('../package.json').version

program
  .version(versionCode)
  .command('create <name>')
  .description('确认创建一个新项目吗？')
  // -f or --force 为强制创建，如果创建的目录存在则直接覆盖
  .option('-f, --force', '强制创建传入')
  .action((name, options) => {
    require('../lib/create.js')(name, options)
  })


program
  // 版本号信息
  .version(versionCode)
  .usage('<command> [option]')
program.parse(process.argv)
