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


import strategy from '../../core/proxy';

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

        forEachField(curInfo.schemaInfo.schema, (field, typeName, fieldName) => {
            // field.proxy(function () {
            //     console.log(arguments);
            // });
        });

        // addMockFunctionsToSchema({schema: curInfo.schemaInfo.executableSchema});

        // addMockFunctionsToSchema({schema: curInfo.schemaInfo.executableSchema, mocks: {
        //     String: () => 'Hello',
        //     Post: () => ({
        //         // title: 'sdsd'
        //         title: () => String(+new Date),
        //     }),
        //     // for user.graphql
        //     Query: () => ({
        //         posts() {
        //           return posts;
        //         },
        //         author(_, { id }) {
        //           return find(authors, { id: id });
        //         },
        //     }),
        //     CustomNameQuery: () => ({
        //         posts() {
        //           return [{ id: 1, title: 'asdasads', votes: 2 }];
        //         },
        //         author(_, { id }) {
        //           return find(authors, { id: id });
        //         },
        //     })
        // }, preserveResolvers: true});

        // test

        // makeExecutableSchema({
        //     typeDefs: global.executableSchemaContent,
        //     resolvers: {
        //         Query: {
        //             posts() {
        //                 return posts;
        //             },
        //             author(_, {id}) {
        //                 console.log(_, {id});
        //                 return find(authors, { id: id });
        //             }
        //         }
        //     }
        // });

        // curInfo.schemaInfo.getCurExecutableSchema(undefined, {
        //     Query: {
        //         posts() {
        //             return posts;
        //         },
        //         author(_, {id}) {
        //             console.log(_, {id});
        //             return find(authors, { id: id });
        //         },
        //     }
        // })

        // addMockFunctionsToSchema({schema: curInfo.schemaInfo.getCurExecutableSchema(), mocks: {
        //     String: () => 'dsdsdsd',
        //     Post: () => ({
        //         // title: 'sdsd'
        //         title: () => 'dddd',
        //     }),
        //     CustomNameQuery: () => ({
        //         posts: (root, args) => {
        //             return ['a', 'b']
        //         },
        //         author: (root, args) => {
        //             return {
        //                 name: 'nnnn'
        //             }
        //         }
        //     })
        // }});
        // test

        // const queryType = mockServerRet.data.__schema.queryType;

        // console.log(JSON.stringify(mockServerRet.data, null, 4));
        // console.log(JSON.stringify(customTypes, null, 4));
        // console.log(await curInfo.schemaInfo.mockServerQuery(typeQuery, {
        //         name: 'Post'
        // }));
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

router.get('/test', async (ctx, next) => {
    const TYPE = 'cographql/test';
    try {
        const curInfo = core.getInfo();
        console.log(ctx.query);
        console.log(strategy);
        strategy['Int'].resolve = (root, args, context, info) => {
            console.log(root, args, context, info);
            return 99;
        };
        // eg
        // Query posts Post title
        //
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
