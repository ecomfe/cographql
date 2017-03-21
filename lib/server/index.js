/**
 * CoGraphQL
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file CoServer
 * @author ielgnaw(wuji0223@gmail.com)
 */

import 'babel-polyfill';
import http from 'http';
import {readFileSync} from 'fs';
import {join} from 'path';
import webpack from 'webpack';
import Koa from 'koa';
import graphQLHTTP from 'koa-graphql';
import mount from 'koa-mount';
import convert from 'koa-convert';
import koaStatic from 'koa-static';
import bodyparser from 'koa-bodyparser';
import json from 'koa-json';
import onerror from 'koa-onerror';
import webpackMiddleware from 'koa-webpack-middleware';
import casual from 'casual-browserify';
import {find, filter} from 'lodash';

import {getIP} from '../util';
import {routes, allowedMethods} from './router/config';
import webpackConf from '../conf/webpack.conf';
import CONSTANT from '../conf/constant';
import * as core from '../core';

/**
 * server run
 */
const run = () => {
    const app = new Koa();
    const {devMiddleware, hotMiddleware} = webpackMiddleware;

    app.use(convert(bodyparser()));
    app.use(convert(json()));
    app.use(convert(koaStatic(join(__dirname, '../web'))));

    app.use(convert.compose(routes));
    app.use(convert.compose(allowedMethods));

    const curInfo = core.getInfo();
    const executableSchema = curInfo.schemaInfo.executableSchema;

    app.use(mount('/graphql', convert(graphQLHTTP({
        schema: executableSchema,
        pretty: true,
        graphiql: true
    }))));

    const compiler = webpack(webpackConf);
    app.use(convert(devMiddleware(compiler, {
        stats: {
            colors: true
        },
        noInfo: true
    })));
    app.use(convert(hotMiddleware(compiler)));

    onerror(app);
    app.on('error', (err, ctx) => {
        console.log(err);
    });

    const server = http.createServer(app.callback());
    server.listen(CONSTANT.PORT);

    server.on('error', error => {
        if (error.syscall !== 'listen') {
            throw error;
        }

        const bind = typeof CONSTANT.PORT === 'string' ? ('Pipe ' + CONSTANT.PORT) : 'Port ' + CONSTANT.PORT;

        switch (error.code) {
            case 'EACCES':
                console.error(bind + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(bind + ' is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    });

    server.on('listening', () => {
        const addr = server.address();
        console.log('Listening at http://localhost:' + addr.port + ' or http://' + getIP() + ':' + addr.port + '\n');
    });
};

export default {
    run: run
};
