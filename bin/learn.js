#!/usr/bin/env node

const program = require('commander');
const chalk = require('chalk');
const init = require('../commands/init.js');

if (!process.argv || process.argv.length <= 2) {
    console.log(chalk.yellow(`\nOptions: \n   -h, --help for a list of available commands.`));
    process.exit(1);
}

program
    .version(require('../package').version);

program
    .command('init [project-name]')
    .description('Generate a new project')
    .alias('i')
    .action((name) => {
        console.log(chalk.yellow(''));
        init(name)
    });

program.on('command:*', () => {
    console.log(chalk.red(`Invalid command: ${program.args.join(' ')}\nSee --help for a list of available commands.`));
    process.exit(1);
});

program.parse(process.argv);
