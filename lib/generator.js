// lib/generator.js

const { getRepoList, getTagList } = require('./request')
const clear = require('clear')
const figlet =require('figlet')
const pack = require('../package.json')
const path = require('path')
const ora = require('ora')
const chalk = require('chalk')
const inquirer = require('inquirer')
const util = require('util')
const downloadGitRepo = require('download-git-repo') // 不支持 Promise
const log = content => console.log(chalk.green(content))

// 添加加载动画
async function wrapLoading(fn, message, ...args) {
  log(message)
  // 使用 ora 初始化，传入提示信息 message
  const spinner = ora(message)
  // 开始加载动画
  spinner.start()

  try {
    // 执行传入方法 fn
    const result = await fn(...args)
    // 状态为修改为成功
    spinner.succeed('完成')
    return result
  } catch (error) {
    // 状态为修改为失败
    spinner.fail('获取模板失败，请重试！')
    log('模板生成失败，请重试！')
  }
}

class Generator {
  constructor (name, targetDir){
    // 目录名称
    this.name = name;
    // 创建位置
    this.targetDir = targetDir;
    // 异步执行下载
    this.downloadGitRepo = util.promisify(downloadGitRepo);
  }

  // 获取用户选择的模板
  // 1）从远程拉取模板数据
  // 2）用户选择自己新下载的模板名称
  // 3）return 用户选择的名称

  async getRepo() {
    // 1）从远程拉取模板数据
    const repoList = await wrapLoading(getRepoList, chalk.blue('模板获取中，请等待...'))
    if (!repoList?.length) return;

    // 返回全部
    // const repos = repoList.map(item => item.name))
    // 过滤我们需要的模板名称
    let repos = []
    repoList.map(item => {
      if (item.name.includes('uni') || item.name.includes('vue') || item.name.includes('xianyu-blog')) {
        repos.push(item.name)
      }
    })

    // 2）用户选择自己新下载的模板名称
    const o = await inquirer.prompt({
      name: 'repo',
      type: 'list',
      choices: repos,
      message: '请选择你要创建的项目模板'
    })
    log(0)
    // 3）return 用户选择的名称
    return o.repo;
  }

  // 获取用户选择的版本
  // 1）基于 repo 结果，远程拉取对应的 tag 列表
  // 2）用户选择自己需要下载的 tag
  // 3）return 用户选择的 tag

  async getTag(repo) {
    // 1）基于 repo 结果，远程拉取对应的 tag 列表
    const tags = await wrapLoading(getTagList, chalk.blue('版本号获取中，请等待...'), repo);
    if (!tags?.length) return;

    // 过滤我们需要的 tag 名称
    const tagsList = tags.map(item => item.name);

    // 2）用户选择自己需要下载的 tag
    const { tag } = await inquirer.prompt({
      name: 'tag',
      type: 'list',
      choices: tagsList,
      message: '请选择版本号'
    })

    // 3）return 用户选择的 tag
    return tag
  }

  // 核心创建逻辑
  // 1）获取模板名称
  // 2）获取 tag 名称
  // 3）下载模板到模板目录
  async create(){
    // 1）清屏
    clear()
    // 2）获取模板名称
    const repo = await this.getRepo()
    // 3) 获取 tag 名称
    const tag = await this.getTag(repo)
    // 4）下载模板到模板目录
    await this.download(repo, tag)

    log('你选择了项目为:' + repo + '，版本号为:'+ (tag || ''))
    log(`咸鱼博客(http://blog.xianyuya.ltd/)`)

    // 5）打印logo
    await figlet(pack.name, (err, data) => {
      if (err) {
        return
      }
      log(data)
    })
  }

  // 下载远程模板
  // 1）拼接下载地址
  // 2）调用下载方法
  async download(repo, tag){

    // 1）拼接下载地址
    const requestUrl = `s-xianyu/${repo}${tag?'#'+tag:''}`;

    // 2）调用下载方法
    await wrapLoading(
      this.downloadGitRepo, // 远程下载方法
      chalk.blue('模板下载中，请稍后...'), // 加载提示信息
      requestUrl, // 参数1: 下载地址
      path.resolve(process.cwd(), this.targetDir)) // 参数2: 创建位置
  }
}

module.exports = Generator;

