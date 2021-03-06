/*
 * @Author: s-xianyu s22539634@aliyun.com
 * @Date: 2022-02-26 16:15:32
 * @LastEditors: s-xianyu s22539634@aliyun.com
 * @LastEditTime: 2022-07-18 13:38:39
 * @FilePath: /s-xianyu-cli/lib/create.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// lib/create.js

const path = require('path')
const fs = require('fs-extra')
const inquirer = require('inquirer')
const Generator = require('./generator')

// 执行创建命令
module.exports = async function (name, options) {
  console.log('您创建的项目名称为' + name)
  // 当前命令行选择的目录
  const cwd  = process.cwd();
  // 需要创建的目录地址
  const targetAir  = path.join(cwd, name)
  // 目录是否已经存在？
  if (fs.existsSync(targetAir)) {
    // 存在提示是否为强制创建？ -f --force
    if (options.force) {
      await fs.remove(targetAir)
    } else {
      // TODO：询问用户是否确定要覆盖或退出
      let { action } = await inquirer.prompt([
        {
          name: 'action',
          type: 'list',
          message: '目录已存在，请选择一项继续操作！',
          choices: [
            {
              name: '重写',
              value: true
            },{
              name: '退出',
              value: false
            }
          ]
        }
      ])

      if (!action) {
        return;
      } else if (action) {
        // 移除已存在的目录
        console.log(`\r\nRemoving...`)
        await fs.remove(targetAir)
      }
    }
  }

  // 引入Generator创建项目
  const generator = new Generator(name, targetAir);
  // 开始创建项目
  generator.create()
}
