/**
 * @file cographql 相关的 ajax 路由
 * @author ielgnaw(wuji0223@gmail.com)
 */

import KoaRouter from 'koa-router';
import {parse, buildASTSchema} from 'graphql';

import {analyzePath} from '../../util';
import * as core from '../../core';

const router = new KoaRouter({
    prefix: '/cgql'
});

router.get('/schema-info', async (ctx, next) => {
    const TYPE = 'cgql/schema-info';
    try {
        const curInfo = core.getInfo();
        // const mockServerRet = await curInfo.schemaInfo.mockServerQuery(core.INTROSPECTION_QUERY);
        // console.log(JSON.stringify(mockServerRet.data.__schema, null, 2));
        const mockServerRet = await curInfo.schemaInfo.mockServerQuery(core.INTROSPECTION_QUERY);

        // 去掉 built-in 的 type
        // const customTypes = [];
        // for (const item of mockServerRet.data.__schema.types) {
        //     if (item.kind.toLowerCase() === 'object' && !item.name.startsWith('__')) {
        //         customTypes.push(item);
        //     }
        // }
        // delete mockServerRet.data.__schema.types;

        const customTypesMap = {};
        mockServerRet.data.__schema.types.forEach(item => {
            customTypesMap[item.name] = item;
        });

        ctx.body = {
            type: TYPE,
            status: 0,
            data: {
                schemaInfo: mockServerRet.data.__schema,
                schemaTypes: mockServerRet.data.__schema.types,
                schemaTypesMap: customTypesMap
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

router.get('/load-children', async (ctx, next) => {
    const TYPE = 'cgql/load-children';
    try {
        const curInfo = core.getInfo();
        const {type} = ctx.query;
        const mockServerRet = await curInfo.schemaInfo.mockServerQuery(core.TYPE_QUERY, {
            name: type
        });

        ctx.body = {
            type: TYPE,
            status: 0,
            data: mockServerRet.data.__type
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

router.get('/update', async (ctx, next) => {
    const TYPE = 'cgql/update';
    try {
        const curInfo = core.getInfo();
        const {bread, text} = ctx.query;

        const breadArr = bread.split('|');

        // 最后一个是类型
        const path = breadArr.slice(0, -1).reverse();
        const type = breadArr.slice(-1)[0];
        if (core.proxy.proxy[type]) {
            core.proxy.proxy[type].resolve = (root, args, context, info) => {
                const cacheKey = analyzePath(info.path, []).join(',');
                // console.log(path);
                // console.log(JSON.stringify(info, null, 2));
                // console.log(analyzePath(info.path, []).join(','));
                // console.log(path.join(','));
                // console.log();
                if (path[0] === info.fieldName) {
                    if (path.join(',') === cacheKey) {
                        core.proxy.cache[cacheKey] = text;
                        return text;
                    }
                }
                if (core.proxy.cache[cacheKey]) {
                    return core.proxy.cache[cacheKey];
                }
                return core.proxy.proxy[type].defaultVal;
            };
        }

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

/**
 * 获取前端发来的请求
 */
router.get('/query', async (ctx, next) => {
    const TYPE = 'cgql/query';
    try {
        const curInfo = core.getInfo();
        console.log(JSON.stringify(ctx.query));
        console.log(ctx.query);
        console.log();
        console.log(JSON.stringify(parse(ctx.query.query), null, 2));
        console.log();
        const mockServerRet = await curInfo.schemaInfo.mockServerQuery(ctx.query.query);
        console.log('mockServerRet', mockServerRet);

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
