/**
 * @file run 命令描述
 * @author ielgnaw(wuji0223@gmail.com)
 */

export default {
    command: 'run',
    describe: 'After Initialize, run CographQL.',
    builder: {
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
    handler: (argv) => {
        // console.log(argv, 'run');
    }
}
