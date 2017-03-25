/**
 * @file 通用方法
 * @author ielgnaw(wuji0223@gmail.com)
 */

import os from 'os';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

export function getIP() {
    const ifaces = os.networkInterfaces();
    const defultAddress = '127.0.0.1';
    let ip = defultAddress;

    /* eslint-disable fecs-use-for-of, no-loop-func */
    for (const dev in ifaces) {
        if (ifaces.hasOwnProperty(dev)) {
            /* jshint loopfunc: true */
            ifaces[dev].forEach(details => {
                if (ip === defultAddress && details.family === 'IPv4') {
                    ip = details.address;
                }
            });
        }
    }
    /* eslint-enable fecs-use-for-of, no-loop-func */
    return ip;
}

export function cssLoaders(options = {}) {
    const generateLoaders = loaders => {
        const sourceLoader = loaders.map(loader => {
            let extraParamChar;
            if (/\?/.test(loader)) {
                loader = loader.replace(/\?/, '-loader?');
                extraParamChar = '&';
            }
            else {
                loader = loader + '-loader';
                extraParamChar = '?';
            }
            return loader + (options.sourceMap ? extraParamChar + 'sourceMap' : '');
        }).join('!');

        if (options.extract) {
            return ExtractTextPlugin.extract('style-loader', sourceLoader);
        }
        return ['style-loader', sourceLoader].join('!');
    };
    return {
        css: generateLoaders(['css']),
        postcss: generateLoaders(['css']),
        less: generateLoaders(['css', 'less']),
        sass: generateLoaders(['css', 'sass?indentedSyntax']),
        scss: generateLoaders(['css', 'sass']),
        stylus: generateLoaders(['css', 'postcss', 'stylus']),
        styl: generateLoaders(['css', 'postcss', 'stylus'])
    };
}

export function styleLoaders(options) {
    const output = [];
    const loaders = cssLoaders(options);
    for (const extension of Object.keys(loaders)) {
        if (loaders.hasOwnProperty(extension)) {
            const loader = loaders[extension];
            output.push({
                test: new RegExp('\\.' + extension + '$'),
                loader: loader
            });
        }
    }
    return output;
}

export function analyzePath(path, ret) {
    if (path.prev) {
        analyzePath(path.prev, ret);
    }
    // 为数字说明是 list 类型，这里可以不考虑
    if (isNaN(path.key)) {
        ret.unshift(path.key);
    }
    return ret;
}
