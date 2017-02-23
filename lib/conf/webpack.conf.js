/**
 * @file webpack conf
 * @author ielgnaw(wuji0223@gmail.com)
 */

import {join} from 'path';
import webpack from 'webpack';
import autoprefixer from 'autoprefixer';
import eslintFriendlyFormatter from 'eslint-friendly-formatter';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import rider from 'rider';

const PROJECT_ROOT = join(__dirname, '../web');

function cssLoaders(options = {}) {
    const generateLoaders = (loaders) => {
        const sourceLoader = loaders.map((loader) => {
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
        else {
            return ['style-loader', sourceLoader].join('!');
        }
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

function styleLoaders(options) {
    const output = [];
    const loaders = cssLoaders(options);
    for (const extension in loaders) {
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

console.log(__dirname, process.cwd());

const conf =  {
    entry: {
        'lib/web/App': join(__dirname, '../web', 'App.js')
    },
    output: {
        path: join(__dirname, '../web'),
        publicPath: '/',
        filename: '[name].js'
    },
    resolve: {
        extensions: ['', '.js', '.jsx'],
        fallback: [join(__dirname, '../../node_modules')],
        alias: {
            src: join(__dirname, '../web')
        }
    },
    resolveLoader: {
        fallback: [join(__dirname, '../../node_modules')]
    },
    postcss: [
        autoprefixer({
            browsers: ['iOS >= 7', 'Android >= 4.0']
        })
    ],
    stylus: {
        use: [rider()]
    },
    module: {
        loaders: styleLoaders().concat([
            {
                test: /\.jsx?$/,
                loader: 'babel',
                include: PROJECT_ROOT,
                exclude: /node_modules/,
                query: {
                    presets: ['react', 'es2015', 'stage-2']
                }
            },
            {
                test: /\.json$/,
                loader: 'json'
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: 'url',
                query: {
                    limit: 1000,
                    name: 'img/[name].[hash:7].[ext]'
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                loader: 'url',
                query: {
                    limit: 1000,
                    name: 'font/[name].[hash:7].[ext]'
                }
            }
        ])
    },
    devtool: '#eval-source-map',
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('development')
            }
        }),

        new webpack.optimize.OccurenceOrderPlugin(),

        new webpack.HotModuleReplacementPlugin(),

        new webpack.NoErrorsPlugin(),

        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: join(__dirname, '../web/index.html'),
            inject: true
        })
    ],
    eslint: {
        formatter: eslintFriendlyFormatter
    }
};

Object.keys(conf.entry).forEach(name => {
    // conf.entry[name] = ['./lib/conf/dev-client'].concat(conf.entry[name]);
    conf.entry[name] = [join(__dirname, './dev-client')].concat(conf.entry[name]);
});

export default conf;

