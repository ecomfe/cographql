/**
 * @file cographql 相关的 ajax 路由
 * @author ielgnaw(wuji0223@gmail.com)
 */

import KoaRouter from 'koa-router';
import {join, dirname, basename} from 'path';
import {renameSync, statSync, createReadStream} from 'fs';
import {
  GraphQLObjectType,
  getNamedType
} from 'graphql';
import {makeExecutableSchema, addMockFunctionsToSchema, MockList, mockServer} from 'graphql-tools';
import { find, filter } from 'lodash';


import {forEachField} from 'graphql-tools';

import * as core from '../../core';

import {simpleIntrospectionQuery, typeQuery} from '../../query';


import proxy from '../../core/proxy';

const router = new KoaRouter({
    prefix: '/cographql'
});

const authors = [
  { id: 1, name: 'Coleman' },
  { id: 2, name: 'Stubailo' },
];

const posts = [
  { id: 1, authorId: 1, title: 'Introduction to GraphQL', votes: 2 },
  { id: 2, authorId: 2, title: 'GraphQL Rocks', votes: 3 },
  { id: 3, authorId: 2, title: 'Advanced GraphQL', votes: 1 },
];

router.get('/schema-info', async (ctx, next) => {
    const TYPE = 'cographql/schema-info';
    try {
        const curInfo = core.getInfo();
        const mockServerRet = await curInfo.schemaInfo.mockServerQuery(simpleIntrospectionQuery);

        // 去掉 built-in 的 type
        const customTypes = [];
        for (const item of mockServerRet.data.__schema.types) {
            if (item.kind.toLowerCase() === 'object' && !item.name.startsWith('__')) {
                customTypes.push(item);
            }
        }
        delete mockServerRet.data.__schema.types;

        ctx.body = {
            type: TYPE,
            status: 0,
            data: {
                schemaInfo: mockServerRet.data.__schema,
                schemaTypes: customTypes
            }
        };
    }
    catch (e) {
        console.log(e);
        ctx.status = 500;
        ctx.body = {
            type: TYPE,
            status: 1,
            statusInfo: '系统异常，请稍候再试'
        };
    }
});

function analyzePath(path, ret) {
    if (path.prev) {
        analyzePath(path.prev, ret);
    }
    // 为数字说明是 list 类型，这里可以不考虑
    if (isNaN(path.key)) {
        ret.unshift(path.key);
    }
    return ret;
}

router.get('/test', async (ctx, next) => {
    const TYPE = 'cographql/test';
    try {
        const curInfo = core.getInfo();
        const {bread, text} = ctx.query;

        const breadArr = bread.split('|');

        // 最后一个是类型，第一个是 QueryType 的名字，在 path 中这俩都不需要
        const path = breadArr.slice(0, -1).slice(1).reverse();
        const type = breadArr.slice(-1);

        if (proxy.proxy[type]) {
            proxy.proxy[type].resolve = (root, args, context, info) => {
                const cacheKey = analyzePath(info.path, []).join(',');
                // console.log(path);
                // console.log(JSON.stringify(info, null, 2));
                // console.log(analyzePath(info.path, []).join(','));
                // console.log(path.join(','));
                // console.log();
                if (path[0] === info.fieldName) {
                    if (path.join(',') === cacheKey) {
                        proxy.cache[cacheKey] = text;
                        return text;
                    }
                }
                if (proxy.cache[cacheKey]) {
                    return proxy.cache[cacheKey];
                }
                return proxy.proxy[type].defaultVal;
            };
        }

        // addMockFunctionsToSchema({schema: curInfo.schemaInfo.executableSchema, mocks: {
        //     String: () => 'Hello',
        //     Post: () => ({
        //         // title: 'sdsd'
        //         title: () => ctx.query.testTitle
        //     }),
        //     // for user.graphql
        //     Query: () => ({
        //         // 如果设置了 posts 那么查询 posts 的时候会走 post resolver，
        //         // 如果没有设置 posts 那么查询 posts 会走 Post resolver
        //         posts(obj, args, context, info) {
        //             console.log(obj);
        //             console.log();
        //             console.log(args);
        //             console.log();
        //             console.log(JSON.stringify(info.fieldNodes, null, 2));
        //             console.log();
        //             console.log(info);
        //             return posts;
        //         },
        //         author(_, { id }) {
        //           return find(authors, { id: id });
        //         },
        //     }),
        //     CustomNameQuery: () => ({
        //         posts() {
        //           return posts;
        //         },
        //         author(_, {id}) {
        //           return find(authors, { id: id });
        //         },
        //     })
        // }});

        ctx.body = {
            type: TYPE,
            status: 0,
            data: {}
        };
    }
    catch (e) {
        console.log(e);
        ctx.status = 500;
        ctx.body = {
            type: TYPE,
            status: 1,
            statusInfo: '系统异常，请稍候再试'
        };
    }
});


export default router;
