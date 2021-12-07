const { getRepoList, getTagList } = require('./http')
const ora = require('ora')
const inquirer = require('inquirer')
// 加载动画效果
async function warpLoading(fn, message, ...args) {
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
  }
  // 获取用户选择的模板
  // 1）从远程拉取模板数据
  // 2）用户选择自己新下载的模板名称
  // 3）return 用户选择的名称
  async getRepo() {
    const repoList = await warpLoading(getRepoList, 'waiting fetch template')
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
    const tags = await warpLoading(getTagList, 'waiting fetch tag', repo);
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
    const tag = await this.getTag(repo)
    console.log('用户选择了，repo=' + repo, 'tag=' + tag)
  }
}

module.exports = Generator;