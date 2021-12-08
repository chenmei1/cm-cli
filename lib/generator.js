const { getRepoList, getTagList } = require('./http')
const ora = require('ora')
const inquirer = require('inquirer')
const downloadGitRepo = require('download-git-repo')
const util = require('util')
const path = require('path')
const chalk = require('chalk')

// 加载动画效果
async function wrapLoading(fn, message, ...args) {
  // 使用ora 的动画效果，传入message
  const spinner = ora(message)
  // 开始动画
  spinner.start()
  try {
    const res = await fn(...args)
    // 状态修改为成功
    spinner.succeed()
    return res
  } catch (err) {
    // 状态修改为失败
    spinner.fail('Request failed,refresh ....')
  }
}

class Generator {
  constructor(name, targetDir) {
    this.name = name;
    this.targetDir = targetDir;
    // 对 download-git-repo 进行 promise 化改造
    this.downloadGitRepo = util.promisify(downloadGitRepo);
  }
  // 下载远程模板
  // 1）拼接下载地址
  // 2）调用下载方法
  async download(repo, tag) {

    // 1）拼接下载地址
    const requestUrl = `zhurong-cli/${repo}${tag ? '#' + tag : ''}`;

    // 2）调用下载方法
    await wrapLoading(
      this.downloadGitRepo, // 远程下载方法
      'waiting download template', // 加载提示信息
      requestUrl, // 参数1: 下载地址
      path.resolve(process.cwd(), this.targetDir)) // 参数2: 创建位置
  }
  // 获取用户选择的模板
  // 1）从远程拉取模板数据
  // 2）用户选择自己新下载的模板名称
  // 3）return 用户选择的名称
  async getRepo() {
    const repoList = await wrapLoading(getRepoList, 'waiting fetch template')
    if (!repoList) return;

    // 过滤我们需要的名称
    const repos = repoList.map(item => item.name)

    // 让用户自己选择需要的模板
    const { repo } = await inquirer.prompt([
      {
        name: 'repo',
        type: 'list',
        choices: repos,
        message: 'Please choose a template to create project'
      }
    ])
    return repo
  }
  // 获取tag名称
  async getTag(repo) {
    // 1）基于 repo 结果，远程拉取对应的 tag 列表
    const tags = await wrapLoading(getTagList, 'waiting fetch tag', repo);
    if (!tags) return;

    // 过滤我们需要的 tag 名称
    const tagsList = tags.map(item => item.name);

    // 2）用户选择自己需要下载的 tag
    const { tag } = await inquirer.prompt({
      name: 'tag',
      type: 'list',
      choices: tagsList,
      message: 'Place choose a tag to create project'
    })

    // 3）return 用户选择的 tag
    return tag
  }

  // 核心创建
  // 1、获取模板的名称
  async create() {
    const repo = await this.getRepo();
    // const tag = await this.getTag(repo)
    console.log('用户选择了，repo=' + repo)
    // 3）下载模板到模板目录
    await this.download(repo)
    // 4）模板使用提示
    console.log(`\r\nSuccessfully created project ${chalk.cyan(this.name)}`)
    console.log(`\r\n  cd ${chalk.cyan(this.name)}`)
    console.log('  npm run dev\r\n')
  }
}

module.exports = Generator;