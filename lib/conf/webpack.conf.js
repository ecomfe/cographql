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

import  {styleLoaders} from '../util';

const PROJECT_ROOT = join(__dirname, '../web');

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
    conf.entry[name] = [join(__dirname, './dev-client')].concat(conf.entry[name]);
});

export default conf;

