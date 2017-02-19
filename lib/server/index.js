/**
 * CoGraphQL
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file CoServer
 * @author ielgnaw(wuji0223@gmail.com)
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import Koa from 'koa';
import graphQLHTTP from 'koa-graphql';
import mount from 'koa-mount';
import convert from 'koa-convert';
import onerror from 'koa-onerror';
import {makeExecutableSchema} from 'graphql-tools';
import {getIP} from './util';

import data from '../../data/user.json';

const executableSchema = makeExecutableSchema({
    typeDefs: fs.readFileSync(path.join(__dirname, '..', '..', 'data', 'user.schema'), 'utf-8'),
    resolvers: {
        Query: {
            user: (_, args) => data[args.id]
        }
    }
});

const PORT = 3001;
const app = new Koa();

app.use(mount('/sss', convert(graphQLHTTP({
    schema: executableSchema,
    pretty: true,
    graphiql: true
}))));

onerror(app);
app.on('error', (err, ctx) => {
    console.log(err);
});

const server = http.createServer(app.callback());
server.listen(PORT);

server.on('error', error => {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof PORT === 'string' ? ('Pipe ' + PORT) : 'Port ' + PORT;

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
