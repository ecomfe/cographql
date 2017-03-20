/**
 * @file init 命令描述
 * @author ielgnaw(wuji0223@gmail.com)
 */

// import {createDir} from '../project-info';
import {createDir} from '../';

export default {
    command: 'init',
    describe: 'Initialize CographQL in current directory.',
    builder: {
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
    },
    handler: argv => {
        createDir(argv);
    }
};
