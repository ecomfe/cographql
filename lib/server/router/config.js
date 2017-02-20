/**
 * @file router config
 * @author ielgnaw(wuji0223@gmail.com)
 */

import KoaRouter from 'koa-router';
import module1 from './module1';

const routes = [];
const allowedMethods = [];

[module1].forEach(router => {
    routes.push(router.routes());
    allowedMethods.push(router.allowedMethods());
});

export {routes, allowedMethods};
