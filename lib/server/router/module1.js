/**
 * @file personal ajax 路由
 * @author ielgnaw(wuji0223@gmail.com)
 */

import KoaRouter from 'koa-router';
import {join, dirname, basename} from 'path';
import {renameSync, statSync, createReadStream} from 'fs';

import * as core from '../../core';

import coManager from '../../manager';

const router = new KoaRouter({
    prefix: '/module1'
});

// router.use('/test', [middlewares]);

router.get('/test', async (ctx, next) => {
    const TYPE = 'module1/test';

    const curProjectInfo = core.getProjectInfo();
    console.log(curProjectInfo);

    coManager();

    // get 参数 获取
    // ctx.query.KEY
    console.log('getArgs', ctx.query);

    try {
        // do something
        ctx.body = {
            type: TYPE,
            status: 0,
            data: {
                x: 1 + 3,
                getArgs: ctx.query
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

router.post('/test', async (ctx, next) => {
    const TYPE = 'module1/test';

    // post 参数获取
    // ctx.request.body.KEY
    console.log('postArgs', ctx.request.body);

    try {
        // do something
        ctx.body = {
            type: TYPE,
            status: 0,
            data: {
                x: 1,
                postArgs: ctx.request.body
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
