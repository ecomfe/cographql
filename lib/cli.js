/**
 * @file 命令行入口
 * @author ielgnaw(wuji0223@gmail.com)
 */

import yargs from 'yargs';
import {join} from 'path';
import sys from '../package.json';

import server from './server';
import {createDir} from './core/project-info';

// import init from './core/command/init';
// import run from './core/command/run';

const argv = yargs
    .updateLocale('en')
    .usage(`Usage: $0 <command> [options]`)
    .commandDir(join(__dirname, './core/command'))
    .example(
        '$0 init -s schema.graphql',
        'Initialize with Graphql schema configuration.'
    )
    .example(
        '$0 init -s schema.json',
        'Initialize with json configuration.'
    )
    .example(
        '$0 init -s schema.graphql -e http://my.dev.server/graphql',
        'Initialize with Graphql schema and remote endpoint configuration.'
    )
    .example(
        '$0 init -s schema.json -e http://my.dev.server/graphql',
        'Initialize with json and remote endpoint configuration.'
    )
    .example('', '')
    .example(
        '$0 run',
        'Run CoGraphQL with already exist configuration.'
    )
    .example(
        '$0 run -e http://my.dev.server/graphql',
        'Run CoGraphQL with remote endpoint configuration.'
    )
    .demand(1, 'Please specify one of the commands!')
    .strict()
    .version(() => `CoGraphQL ${sys.version}\n${sys.description}`)
    .alias('version', 'v')
    .help('h')
    .alias('h', 'help')
    .wrap(null)
    .argv;

// 判断传过来的 schema 是 .json 还是 .schema 生成 ExecutableSchema 传入给 server 然后启动 server
// 如果传入了 endpoint 那么还需要分析 endpoint 进行 schema 的对比然后传入 server 再启动 server
//
// core 中需要有 json => schema 的方法，以及读取远程机器 json/schema 的方法

console.log(createDir());
server.run();
