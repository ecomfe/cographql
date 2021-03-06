/**
 * @file 命令行入口
 * @author ielgnaw(wuji0223@gmail.com)
 */

import yargs from 'yargs';
import {join} from 'path';
import sys from '../package.json';

import server from './server';

// import init from './core/command/init';
// import run from './core/command/run';

yargs
    .updateLocale('en')
    .usage('Usage: $0 <command> [options]')
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

server.run();
