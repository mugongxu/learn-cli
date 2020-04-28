const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');
const validateProjectName = require('validate-npm-package-name');
const config = require('../template');
const getGitUser = require('../lib/git-user');
const downLoad = require('download-git-repo');
const ora = require('ora');

module.exports = async(projectName, options = {}) => {
    // 当前工作目录
    const cwd = options.cwd || process.cwd()
    const inCurrent = !projectName || projectName === '.';
    const name = inCurrent ? path.relative('../', cwd) : projectName;
    // 根据当前工作目录返回 from 到 to 的绝对路径
    const targetDir = path.resolve(cwd, projectName || '.');
    let gitUrl,branch;

    if (inCurrent || fs.existsSync(targetDir)) {
        const { ok } = await inquirer.prompt([
            {
                name: 'ok',
                type: 'confirm',
                message: inCurrent
                    ? 'Generate project in current directory?'
                    : 'Target directory exists. Continue?'
            }
        ])
        if (!ok) {
            process.exit(1);
        }
    }

    const result = validateProjectName(name);
    if (!result.validForNewPackages) {
        console.error(chalk.red(`Invalid project name: "${name}"`));
        result.errors && result.errors.forEach(err => {
            console.error(chalk.red.dim('Error: ' + err));
        });
        result.warnings && result.warnings.forEach(warn => {
            console.error(chalk.red.dim('Warning: ' + warn));
        });
        process.exit(1);
    }

    const promptLists = [
        // 项目名称
        {
            type: 'input',
            message: 'Project name',
            name: 'proname',
            default: name // 默认值
        },
        // 项目描述
        {
            type: 'input',
            message: 'Project description',
            name: 'description',
            default: 'A frontend project of jfz' // 默认值
        },
        // Author
        {
            type: 'input',
            message: 'Author',
            name: 'author',
            default: getGitUser().name // 默认值
        },
        // 选择项目模板
        {
            name: 'tplName',
            type: 'rawlist',
            message: `Pick an frontend template:`,
            choices: [
                { name: 'erp', value: 'erp' },
                { name: 'pc', value: 'pc' },
                { name: 'h5', value: 'h5' }
            ]
        }
    ];

    const { proname, description, author, tplName } = await inquirer.prompt([
        ...promptLists
    ]);

    gitUrl = config.tpl[tplName].url;
    branch = config.tpl[tplName].branch;

    const spinner = ora('downloading template...');
    spinner.start();

    downLoad(`direct:${gitUrl}`, targetDir, { clone: true }, err => {
        spinner.stop();
        if (err) {
            console.error('Failed to download repo ' + gitUrl + ': ' + err.message.trim());
            process.exit(1);
        }
        // package.json文件改写
        fs.readFile(`${targetDir}/package.json`, (err, data) => {
            if (err) throw err;
            let _data = JSON.parse(data.toString())
            _data.name = proname;
            _data.version = '1.0.0';
            _data.description = description;
            _data.author = author;
            // 这样的方式可以输出格式化的json文件
            let str = JSON.stringify(_data, null, 4);
            fs.writeFile(`${targetDir}/package.json`, str, function (err) {
                if (err) throw err;
            })
        });
        // 结束
        console.log(chalk.green('\n √ Generation completed!'));
        console.log(`\n cd ${name} && npm install \n`)
    });
};
