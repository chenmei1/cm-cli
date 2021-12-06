const path = require('path')
const fs = require('fs-extra')

module.exports = async function (name, option) {
  // console.log('>>> create.js', name, option)
  // 执行创建命令
  // 当前命令行所在的目录
  const cwd = process.cwd()
  // 需要创建的目录
  const targetAir = path.join(cwd, name)
  // 判断文件是否存在
  if (fs.existsSync(targetAir)) {

    // 是否为强制创建
    if (option.force) {
      await fs.remove(targetAir)
    } else {

    }
  }

}