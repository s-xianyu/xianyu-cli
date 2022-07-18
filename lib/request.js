/*
 * @Author: s-xianyu s22539634@aliyun.com
 * @Date: 2022-02-26 17:01:20
 * @LastEditors: s-xianyu s22539634@aliyun.com
 * @LastEditTime: 2022-07-18 14:13:06
 * @FilePath: /s-xianyu-cli/lib/request.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// lib/request.js

const {user} = require('./config')
// 通过 axios 处理请求
const axios = require('axios')
axios.interceptors.response.use(res => {
  return res.data;
})


/**
 * 获取模板列表
 * @returns Promise
 */
async function getRepoList() {
  return axios.get(`https://api.github.com/users/${user.username}/repos`)
}

/**
 * 获取版本信息
 * @param {string} repo 模板名称
 * @returns Promise
 */
async function  getTagList(repo) {
  return axios.get(`https://api.github.com/repos/${user.username}/${repo}/tags`)
}

module.exports = {
  getRepoList,
  getTagList
}
