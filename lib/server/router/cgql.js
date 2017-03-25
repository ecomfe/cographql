/**
 * @file cographql 相关的 ajax 路由
 * @author ielgnaw(wuji0223@gmail.com)
 */

import KoaRouter from 'koa-router';
import {parse, buildASTSchema, printSchema} from 'graphql';
import {existsSync, statSync, writeFileSync, readFileSync} from 'fs';

import {analyzePath} from '../../util';
import * as core from '../../core';
import CONSTANT from '../../conf/constant';

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

// 获取 query 的 path
function getQueryPath(query) {
    const definitions = query.definitions;
    const path = {};

    const recursive = (selections, root) => {
        selections.forEach(selection => {
            // if (selection.kind === 'Field') {
            //     if (root) {
            //         root[selection.name.value] = {};
            //     }
            //     else {
            //         path[selection.name.value] = {};
            //     }
            // }
            // if (selection.selectionSet && selection.selectionSet.selections) {
            //     recursive(
            //         selection.selectionSet.selections,
            //         root ? root[selection.name.value] : path[selection.name.value]
            //     );
            // }
            if (selection.kind === 'Field') {
                if (selection.selectionSet) {
                    recursive(
                        selection.selectionSet.selections,
                        root ? (root[selection.name.value] = {}) : (path[selection.name.value] = {})
                    );
                }
                else {
                    // 这里设置成字符串 'false'，是因为 analyzeEndpoint 中要用 path[field.name.value] 来判断
                    root ? (root[selection.name.value] = 'false') : (path[selection.name.value] = 'false')
                }
            }
        });
    };
    definitions.forEach(definition => {
        if (definition.kind === 'OperationDefinition' && definition.operation === 'query') {
            recursive(definition.selectionSet.selections);
        }
    });
    console.log('before path', JSON.stringify(path, null, 2));
    console.log();
    return path;
}

function analyzeEndpoint(endpoint, path) {
    // 注意如果有 schemaDefinition 时可以获取到 QueryType 的名字
    const endDefinitions = endpoint.definitions;
    let typeMap;
    // 先找到 query 对应的 type
    endDefinitions.forEach(endDefinition => {
        if (endDefinition.name.value === 'Query') {
            const fields = endDefinition.fields;
            fields.forEach(field => {
                if (path[field.name.value]) {
                    typeMap = {
                        name: field.name.value,
                        typeName: field.type.name.value
                    }
                }
            });
        }
    });


    if (!typeMap) {
        console.log('after path', JSON.stringify(path, null, 2));
        return;
    }

    // 根据 type 找到对应的 definition
    const definitionByType = endDefinitions.filter(endDefinition => {
        return endDefinition.name.value === typeMap.typeName;
    })[0];

    const recursive = (fields, pathKey, pathObj) => {
        fields.forEach(field => {
            if (field.type.kind === 'ListType') {
                const inner = endDefinitions.filter(item => {
                    if (item.name.value === field.type.type.name.value) {
                        pathKey = field.name.value;
                        return item;
                    }
                })[0];
                // pathObj 不存在说明 query 中没有查询 endpoint definition fields field 的那个字段
                if (inner && pathObj) {
                    pathObj = pathObj[pathKey];
                    recursive(inner.fields, pathKey, pathObj);
                }
            }
            else {
                if (!pathObj) {
                    return;
                }
                Object.keys(pathObj).forEach(key => {
                    if (field.type.name) {
                        const inner = endDefinitions.filter(item => {
                            if (item.name.value === field.type.name.value) {
                                pathKey = field.name.value;
                                return item;
                            }
                        })[0];
                        if (inner && pathObj) {
                            pathObj = pathObj[pathKey];
                            recursive(inner.fields, pathKey, pathObj);
                        }
                    }
                    if (pathObj && pathObj[field.name.value]) {
                        pathObj[field.name.value] = true;
                    }
                });
            }
        });
    }

    Object.keys(path[typeMap.name]).forEach(key => {
        recursive(definitionByType.fields, key, path[typeMap.name]);
    });

    console.log('after path', JSON.stringify(path, null, 2));
}

/**
 * 获取前端发来的请求
 */
router.get('/query', async (ctx, next) => {
    const TYPE = 'cgql/query';
    try {
        const curInfo = core.getInfo();
        // console.log(JSON.stringify(ctx.query));
        // console.log(ctx.query);
        // console.log();
        analyzeEndpoint(
            JSON.parse(readFileSync(curInfo.infoDir + '/' + CONSTANT.ENDPOINT_SCHEMA, 'UTF-8')),
            getQueryPath(parse(ctx.query.query))
        );
        // console.log(JSON.stringify(parse(ctx.query.query), null, 2));
        // console.log();
        // console.log(curInfo);
        // console.log(JSON.stringify(JSON.parse(readFileSync(curInfo.infoDir + '/' + CONSTANT.ENDPOINT_SCHEMA, 'UTF-8')), null, 2));
        const mockServerRet = await curInfo.schemaInfo.mockServerQuery(ctx.query.query, JSON.parse(ctx.query.variables || '{}'));
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
