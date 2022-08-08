// lib/generator.js

const clear = require('clear')
const { getRepoList, getTagList } = require('./request')
const fs = require('fs-extra')
const chalk = require('chalk')
const path = require('path')
const util = require('util')
const figlet = require('figlet')
const pkg = require('../package.json')
const downloadGitRepo = require('download-git-repo') // 不支持 Promise
const Ejs = require('ejs')
const camelCase = require('camelcase')
const { wrapLoading, promptInfo, GreenInfo, ErrInfo } = require('./utils')
const {user} = require('./config')

class Generator {
  constructor (projectName, targetDir){
    // 项目名称 生成的目录名
    this.projectName = projectName
    // 创建位置
    this.targetDir = targetDir;
    // 异步执行下载
    this.downloadGitRepo = util.promisify(downloadGitRepo);
  }

  // 获取用户选择的模板
  // 1）从远程拉取模板数据
  // 2）用户选择自己新下载的模板名称
  // 3）return 用户选择的名称
  async getTemplate (message) {
    // 1）从远程拉取模板数据
    const repoList = await wrapLoading(getRepoList, message)
    if (repoList && repoList.length) {
      const list = repoList.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        clone_url: item.clone_url,
        ssh_url: item.ssh_url
      }))
      // 2）用户选择自己新下载的模板名称和仓库列表
      return {
        repo: await promptInfo(list, '请选择你要创建的项目模板') || [],
        repoList: list
      }
    } else {
      ErrInfo('获取失败，请重试！')
    }
  }

  // 获取用户选择的版本
  // 1）基于 repo 结果，远程拉取对应的 tag 列表
  // 2）用户选择自己需要下载的 tag
  // 3）return 用户选择的 tag

  async getTag(repo, message) {
    // 1）基于 repo 结果，远程拉取对应的 tag 列表
    const tags = await wrapLoading(getTagList, message, repo);
    if (tags && tags.length){
      // 过滤我们需要的 tag 名称
     const tagsList = tags.map(item => ({
      name: item.name
     }));
     // 2）用户选择自己新下载的模板名称和仓库列表
     return {
       tag: await promptInfo(tagsList, '请选择你要创建的版本') || []
     }
    } else {
      console.log(`版本获取失败，使用默认${chalk.green('master')}`)
      return {
        tag: 'master'
      }
    }
  }

  // 下载远程模板
  // 1）拼接下载地址
  // 2）调用下载方法
  async download(repo, tag){
    // 1）拼接下载地址
    const requestUrl = `${user.username}/${repo}${tag?'#'+tag:''}`;
    // 2）调用下载方法
    await wrapLoading(
      this.downloadGitRepo, // 远程下载方法
      chalk.blue('模板下载中，请稍后...'), // 加载提示信息
      requestUrl, // 参数1: 下载地址
      path.resolve(process.cwd(), this.targetDir)) // 参数2: 创建位置
  }

  // 模板字符替换 --- 递归
  // 1）递归模板目录下的所有文件
  // 2）查找所有匹配字符
  // 3）替换所有字段后写入
  async updateTemplate (filePath) {
    // 替换的字段名
    const replaceNameObj = {
      localName: this.projectName,
      camelCasedName: camelCase(this.projectName),
      pascalCasedName: camelCase(this.projectName, { pascalCase: true })
    }
    fs.readdir(filePath, (err, files) => {
      if (files) {
        // 遍历读取到的文件列表
      files.forEach((filename, index) => {
        // 获取当前文件的绝对路径
        const filedir = path.join(filePath, filename)
        fs.stat(filedir, (eror, stats) => {
          const isFile = stats.isFile() // 是文件
          const isDir = stats.isDirectory() //是文件夹
          if (isFile) {
            // 读取文件内容
            const content = fs.readFileSync(filedir, 'utf-8')
            try{
              // 使用Ejs替换模板
              const result = Ejs.render(content, replaceNameObj)
               // 写入文件
              fs.writeFileSync(filedir, result)
            } catch (e) {
              ErrInfo('部分EJS写入失败, 可能项目内使用有EJS语法')
            }

            //修改_得到文件为.
            const relativeFiledir = filedir.replace('_', '.')
            fs.rename(filedir, relativeFiledir, (err) => { })
          }
          // 如果是文件夹，就继续遍历该文件夹下面的文件
          if (isDir) {
            this.updateTemplate(filedir)
          }
        })
      })
      }
    })
  }

  // 核心创建逻辑
  // 1）获取模板名称
  // 2）获取 tag 名称
  // 3）下载模板到模板目录
  async create(){
    // 1）清屏
    clear()
    // 1）获取加星项目列表
    const { repo, repoList } = await this.getTemplate(`模板获取中，请等待...`)
    if (!!repo && repo.length) {
      const { tag } = await this.getTag(repo, `版本获取中，请等待...`)
      await this.download(repo, tag)
      await this.updateTemplate(this.projectName)

      GreenInfo(`
  🐈issues地址：https://github.com/s-xianyu/xianyu-cli/issues
      `)
      figlet.text(pkg.name, {
        font: 'Standard'
      }, (err, data) => {
        if (err) {
          console.log('Something went wrong...')
          console.dir(err)
          return
        }
        GreenInfo(data)
      })
    } else {
      ErrInfo('模板获取失败，请重试')
    }
  }
}

module.exports = Generator;

