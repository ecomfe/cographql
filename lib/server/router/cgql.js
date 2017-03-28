/**
 * @file cographql 相关的 ajax 路由
 * @author ielgnaw(wuji0223@gmail.com)
 */

import KoaRouter from 'koa-router';
import {parse, buildASTSchema, printSchema, graphql} from 'graphql';
import {existsSync, statSync, writeFileSync, readFileSync} from 'fs';
import fetch from 'node-fetch';

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
                // console.log(cacheKey);
                // console.log(path.join(','));
                // console.log();
                if (path[0] === info.fieldName) {
                    if (path.join(',') === cacheKey) {
                        core.proxy.cache[cacheKey] = text;
                        return text;
                    }
                }
                // console.log('JSON.stringify(info, null, 2)', JSON.stringify(info, null, 2));
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
                        root ? (root[selection.name.value] = {
                            args: selection.arguments,
                            value: 'false',
                            hasChildField: true // 这个属性是为了之后的 convertJson2Query 使用
                        }) : (path[selection.name.value] = {
                            args: selection.arguments,
                            value: 'false',
                            hasChildField: true
                        })
                    );
                }
                else {
                    // 这里设置成字符串 'false'，是因为 analyzeEndpoint 中要用 path[field.name.value] 来判断
                    // root
                    //     ? (root[selection.name.value].value = 'false')
                    //     : (path[selection.name.value].value = 'false')
                    root ? (root[selection.name.value] = {
                        args: selection.arguments,
                        value: 'false',
                        hasChildField: false
                    }) : (path[selection.name.value] = {
                        args: selection.arguments,
                        value: 'false',
                        hasChildField: false
                    })
                }
            }
        });
    };
    definitions.forEach(definition => {
        if (definition.kind === 'OperationDefinition' && definition.operation === 'query') {
            recursive(definition.selectionSet.selections);
        }
    });
    // console.log('before path', JSON.stringify(path, null, 2));
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
        // console.log('after path', JSON.stringify(path, null, 2));
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
                pathObj.value = true;
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
                    if (pathObj && pathObj[field.name.value] && pathObj[field.name.value].value) {
                        pathObj[field.name.value].value = true;
                    }
                });
            }
        });
    }

    Object.keys(path[typeMap.name]).forEach(key => {
        if (key !== 'args') {
            recursive(definitionByType.fields, key, path[typeMap.name]);
        }
    });

    // console.log('after path', JSON.stringify(path, null, 2));
    return path;
}

function isObject(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]' && obj.constructor.name === 'Object';
}

function dealArgs(args) {
    let ret = '';
    args.forEach((item, index) => {
        const value = item.value.kind === 'StringValue'
            ? `"${item.value.value}"`
            : item.value.value;

        ret += `${item.name.value}: ${value}`;

        if (index !== args.length - 1) {
            ret += ', ';
        }
    });
    return ret;
}

function convertJson2Query(json) {
    const ret = [];

    const jsonKeys = Object.keys(json);
    for (let i = 0, len = jsonKeys.length; i < len; i++) {
        const key = jsonKeys[i];
        if (key === 'value') {
            continue;
        }
        if (!isObject(json[key])) {
            continue;
        }
        if (json[key].value === 'false') {
            continue;
        }

        if (json[key].hasChildField) {
            let args = '';
            if (json[key].args && json[key].args.length) {
                args = `(${dealArgs(json[key].args)})`;
            }
            ret.push(`${key}${args} { ${convertJson2Query(json[key])} }`);
        }
        else {
            ret.push(`${key} `);
        }
    }

    return ret.join(' ');
}

// mergeData 时，策略是以 endpoint 为主
// 对 list 的情况，默认的 mock list 有四条结果，但是最终 merge 的时候按 endpoint 来算，
// 如果 endpoint 没有，才会采用 mock list 的结果
function mergeData(localData, endpointData) {
    Object.keys(endpointData).forEach(endpointDataKey => {
        if (localData[endpointDataKey]) {
            if (isObject(endpointData[endpointDataKey])) {
                mergeData(localData[endpointDataKey], endpointData[endpointDataKey]);
            }
            else if (Array.isArray(endpointData[endpointDataKey])) {
                const len = endpointData[endpointDataKey].length;
                const localLen = localData[endpointDataKey].length;
                // 长度以 endpoint 为主
                if (localLen > len) {
                    localData[endpointDataKey].splice(0, localLen - len);
                }
                for (let i = 0; i < len; i++) {
                    if (isObject(endpointData[endpointDataKey][i])) {
                        mergeData(
                            localData[endpointDataKey][i] ? localData[endpointDataKey][i] : {},
                            endpointData[endpointDataKey][i]
                        );
                    }
                    else {
                        localData[endpointDataKey][i] = endpointData[endpointDataKey][i];
                    }
                }
            }
            else {
                localData[endpointDataKey] = endpointData[endpointDataKey];
            }
        }
        else {
            localData[endpointDataKey] = endpointData[endpointDataKey];
        }
    });
    return localData;
}

/**
 * 获取前端发来的请求
 */
router.post('/query', async (ctx, next) => {
    const TYPE = 'cgql/query';
    try {
        const curInfo = core.getInfo();
        // const query = ctx.query.query;
        const query = ctx.request.body.query;

        // 没有远程 endpoint
        if (!curInfo.endpointUrl) {
            let onlyMockRet = await graphql(
                curInfo.schemaInfo.executableSchema,
                query,
                {},
                {},
                JSON.parse(ctx.query.variables || '{}')
            );
            console.log('local onlyMockRet', JSON.stringify(onlyMockRet, null, 2));
            // 本地出错并不是真正出错，可能有个字段本地没有，但是远程是有的，这种情况会报错，但实际上应该把远程的数据返回
            if (onlyMockRet.errors) {
                localErrors = onlyMockRet.errors;
            }
            ctx.body = {
                type: TYPE,
                status: 0,
                data: onlyMockRet.data || onlyMockRet.errors
            };
            return;
        }

        const diffRetJson = analyzeEndpoint(
            JSON.parse(readFileSync(curInfo.infoDir + '/' + CONSTANT.ENDPOINT_SCHEMA, 'UTF-8')),
            getQueryPath(parse(query))
        );

        // console.log('getQueryPath(parse(query))', JSON.stringify(getQueryPath(parse(query)), null, 2));
        // console.log();
        // console.log('diffRetJson', diffRetJson);

        let optimizeQuery;
        let endpointQuery;
        // console.log('diffRetJson', JSON.stringify(diffRetJson, null, 2));
        // console.log();
        if (diffRetJson) {
            optimizeQuery = convertJson2Query(diffRetJson);
            endpointQuery = `{${optimizeQuery}}`;
        }
        else {
            optimizeQuery = endpointQuery = query;
        }
        console.log('optimizeQuery', optimizeQuery);

        let localErrors;
        // 先查本地
        let mockServerRet = await graphql(
            curInfo.schemaInfo.executableSchema,
            query,
            {},
            {},
            JSON.parse(ctx.query.variables || '{}')
        );
        console.log('local mockServerRet', JSON.stringify(mockServerRet, null, 2));
        // 本地出错并不是真正出错，可能有个字段本地没有，但是远程是有的，这种情况会报错，但实际上应该把远程的数据返回
        if (mockServerRet.errors) {
            localErrors = mockServerRet.errors;
        }

        // 再查远程
        let fetchEndpoint;
        let endpointData;
        let endpointErrors;
        fetchEndpoint = await fetch(curInfo.endpointUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: endpointQuery
            })
        });
        endpointData = await fetchEndpoint.json();
        console.log('endpoint: ', JSON.stringify(endpointData, null, 2));
        // 如果远程出错了，那就是真的错误
        if (endpointData.errors) {
            endpointErrors = endpointData.errors;
        }

        let returnData;
        // 远程有错直接返回错误
        if (endpointErrors) {
            returnData = endpointErrors;
        }
        else {
            // 远程没错，本地有错，返回远程数据
            if (localErrors) {
                returnData = endpointData.data;
            }
            // 远程没错，本地也没错，返回 merge 数据
            else {
                returnData = mergeData(mockServerRet.data, endpointData.data)
            }
        }

        // console.log('merge: ', mergeData(mockServerRet.data, data));
        ctx.body = {
            type: TYPE,
            status: 0,
            // data: /*mockServerRet.errors || */
                // 自省 query 暂时不用 mergeData
                // (diffRetJson ? mergeData(mockServerRet.data, data) : mockServerRet.data)
            data: returnData
        };
    }
    catch (e) {
        console.log(111, e);
        ctx.status = 500;
        ctx.body = {
            type: TYPE,
            status: 1,
            statusInfo: e
        };
    }
});

export default router;
