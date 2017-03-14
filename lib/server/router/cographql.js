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



import {forEachField} from 'graphql-tools';

import * as core from '../../core';

import {simpleIntrospectionQuery} from '../../query';

const router = new KoaRouter({
    prefix: '/cographql'
});

router.get('/schema-info', async (ctx, next) => {
    const TYPE = 'cographql/schema-info';

    try {
        const curProjectInfo = core.getProjectInfo();
        const mockServerRet = await curProjectInfo.schemaInfo.mockServerQuery(simpleIntrospectionQuery);
        // console.log(JSON.stringify(mockServerRet, null, 4));
        // console.log(mockServerRet.data.__schema);
        const customTypes = [];
        // console.log(types);
        for (const item of mockServerRet.data.__schema.types) {
            if (item.kind.toLowerCase() === 'object' && !item.name.startsWith('__')) {
                customTypes.push(item);
            }
        }
        delete mockServerRet.data.__schema.types;
        console.log(JSON.stringify(mockServerRet.data.__schema, null, 4));
        console.log(JSON.stringify(customTypes, null, 4));
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

export default router;