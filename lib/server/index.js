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
import {makeExecutableSchema, addMockFunctionsToSchema, MockList} from 'graphql-tools';
import {GraphQLObjectType, getNamedType, introspectionQuery} from 'graphql';
import casual from 'casual-browserify';

import {getIP} from '../util';
import {routes, allowedMethods} from './router/config';
import webpackConf from '../conf/webpack.conf';
import CONSTANT from '../conf/constant';
import data from '../../example/data/user.json';

const executableSchema = makeExecutableSchema({
    typeDefs: readFileSync(join(__dirname, '../../example/data', 'user.graphql'), 'utf-8'),
    // resolvers: {
    //     Query: {
    //         user: (_, args) => data[args.id]
    //     }
    // }
});
// console.log(introspectionQuery);
// console.log(casual);
// Object.keys(casual).forEach(i => {
//     console.log(i);
// })

addMockFunctionsToSchema({schema: executableSchema, mocks: {
    Int: () => 6,
    Float: () => 22.1,
    String: () => 'Hello',
    Task: () => ({text: casual.sentence}),
    User: () => ({
        name: casual.name,
        lists: () => new MockList(3, (user) => ({ owner: user.id })),
    }),
}});


// console.log(executableSchema);
// console.log();
// console.log(executableSchema.getTypeMap());
// console.log();
// const typeMap = executableSchema.getTypeMap();
// Object.keys(typeMap).forEach((typeName) => {
//     const curType = typeMap[typeName];

//     // TODO: maybe have an option to include these?
//     if (!getNamedType(curType).name.startsWith('__') && curType instanceof GraphQLObjectType) {
//         console.log(curType, curType.getFields());
//         const fields = curType.getFields();
//         Object.keys(fields).forEach((fieldName) => {
//             const field = fields[fieldName];
//             field.resolve = () => {
//                 return (root, args, ctx, info) => {
//                     return ret;
//                 };
//             }
//         //     fn(field, typeName, fieldName);
//         });
//     }
// });

/**
 * server run
 */
const run = () => {
    const app = new Koa();
    const {devMiddleware, hotMiddleware} = webpackMiddleware;

    app.use(mount('/graphiql', convert(graphQLHTTP({
        schema: executableSchema,
        pretty: true,
        graphiql: true
    }))));

    app.use(convert(bodyparser()));
    app.use(convert(json()));
    app.use(convert(koaStatic(join(__dirname, '../web'))));

    app.use(convert.compose(routes));
    app.use(convert.compose(allowedMethods));

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
