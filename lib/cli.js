/**
 * @file 命令行入口
 * @author ielgnaw(wuji0223@gmail.com)
 */

import yargs from 'yargs';
import {join} from 'path';
import sys from '../package.json';

import './server';

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
            description: 'port to use [default: 8800]',
            requiresArg: true,
            required: false
        }
    })
    .argv;
