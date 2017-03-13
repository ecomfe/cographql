/**
 * @file cographql 相关的 ajax 路由
 * @author ielgnaw(wuji0223@gmail.com)
 */

import KoaRouter from 'koa-router';
import {join, dirname, basename} from 'path';
import {renameSync, statSync, createReadStream} from 'fs';

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
        ctx.body = {
            type: TYPE,
            status: 0,
            data: mockServerRet
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
