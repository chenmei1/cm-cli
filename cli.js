#! /usr/bin/env node

const inquirer = require('inquirer')

inquirer.prompt([
  {
    type: 'input', //type： input, number, confirm, list, checkbox ... 
    name: 'name', // key 名
    message: 'Your name', // 提示信息
    default: 'cm-cli' // 默认值
  }
]).then(answers => {
  // 打印互用输入结果
  console.log(answers)
})

