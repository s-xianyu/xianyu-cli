/*
 * @Author: s-xianyu s22539634@aliyun.com
 * @Date: 2022-04-03 13:20:04
 * @LastEditors: s-xianyu s22639634@aliyun.com
 * @LastEditTime: 2022-07-19 09:43:04
 * @FilePath: /s-xianyu-cli/lib/utils.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// lib/utils.js
const ora = require('ora')
const chalk  = require('chalk')
const inquirer = require('inquirer')
const GreenInfo = content => console.log(chalk.green(content))
const RedInfo = content => console.log(chalk.red(content))
const ErrInfo = content => {
  console.log(chalk.red(`/***
 * ${content}
 * ${content}
 * ${content}
 */`))
}
/**
 * 添加加载动画
 * @param fn
 * @param message
 * @param args
 * @returns {Promise<*>}
 */
async function wrapLoading(fn, message, ...args) {
  // 使用 ora 初始化，传入提示信息 message
  const spinner = ora(message)
  // 开始加载动画
  spinner.start()
  try {
    // 执行传入方法 fn
    const result = await fn(...args)
    // console.log(result)
    // 状态为修改为成功
    spinner.succeed()
    return result
  } catch (error) {
    // 状态为修改为失败
    spinner.fail()
  }
}

/**
 * 用户选项
 * @param list
 * @param message
 * @returns {Promise<*>}
 */
async function promptInfo(list, message) {
  const o = await inquirer.prompt({
    name: 'name',
    type: 'list',
    choices: list.map(item => {
      return {
        name: item.name,
        short: item.name + (item.description ? `   (${item.description})` : '')
      }
    }),
    message: message
  })
  return o.name
}
module.exports = {
  wrapLoading,
  promptInfo,
  GreenInfo,
  RedInfo,
  ErrInfo
}
