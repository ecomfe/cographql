/**
 * @file cographql 首页
 * @author ielgnaw(wuji0223@gmail.com)
 */

import KoaRouter from 'koa-router';

import {analyzePath} from '../../util';
import * as core from '../../core';

const router = new KoaRouter();

router.get('/cographql', async (ctx, next) => {
    const TYPE = '/cographql';
    ctx.body = await ctx.render('index.html');
});

export default router;
