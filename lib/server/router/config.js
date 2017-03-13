/**
 * @file router config
 * @author ielgnaw(wuji0223@gmail.com)
 */

import KoaRouter from 'koa-router';
import module1 from './module1';
import cographql from './cographql';

const routes = [];
const allowedMethods = [];

[module1, cographql].forEach(router => {
    routes.push(router.routes());
    allowedMethods.push(router.allowedMethods());
});

export {routes, allowedMethods};
