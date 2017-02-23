/**
 * @file 命令行入口
 * @author ielgnaw(wuji0223@gmail.com)
 */

import yargs from 'yargs';
import {join} from 'path';
import sys from '../package.json';

import server from './server';
import core from './core';

console.log(server);

const argv = yargs
    .updateLocale('en')
    .usage(`Usage: $0 [options]`)
    .help('help')
    .alias('help', 'h')
    .version(() => sys.version)
    .alias('version', 'v')
    .options({
        schema: {
            alias: 's',
            description: '<filename> target GraphQL schema file',
            requiresArg: true,
            required: true
        },
        endpoint: {
            alias: 'e',
            description: '[url] implemented GraphQL endpoint',
            requiresArg: true,
            required: false
        },
        address: {
            alias: 'a',
            description: 'address to use [default: 0.0.0.0]',
            requiresArg: true,
            required: false
        },
        port: {
            alias: 'p',
            description: 'port to use [default: 3001]',
            requiresArg: true,
            required: false
        }
    })
    .argv;


// 判断传过来的 schema 是 .json 还是 .schema 生成 ExecutableSchema 传入给 server 然后启动 server
// 如果传入了 endpoint 那么还需要分析 endpoint 进行 schema 的对比然后传入 server 再启动 server
//
// core 中需要有 json => schema 的方法，以及读取远程机器 json/schema 的方法

server.run()
console.log(argv);
