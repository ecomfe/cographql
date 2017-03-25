/**
 * @file router config
 * @author ielgnaw(wuji0223@gmail.com)
 */

import KoaRouter from 'koa-router';
import cgql from './cgql';
import cographql from './cographql';

const routes = [];
const allowedMethods = [];

[cgql, cographql].forEach(router => {
    routes.push(router.routes());
    allowedMethods.push(router.allowedMethods());
});

export {routes, allowedMethods};
