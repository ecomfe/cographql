/**
 * @file 当前项目 schema 模块
 * @author ielgnaw(wuji0223@gmail.com)
 */

import {readFileSync} from 'fs';
import {graphql} from 'graphql';

import {getExecutableSchema, getGraphQLSchema, getMockServer} from './graphql';

import {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLEnumType,
    GraphQLUnionType,
    GraphQLInterfaceType,
    GraphQLList,
    GraphQLType,
    GraphQLField,
    GraphQLResolveInfo,
    getNullableType,
    getNamedType,
    GraphQLNamedType,
    GraphQLFieldResolver,
    GraphQLScalarType,
    GraphQLNonNull,
    GraphQLInputObjectType
} from 'graphql';
import {forEachField} from 'graphql-tools';

import strategy from './proxy';

/**
 * 项目 schema 类
 */
export default class SchemaInfo {

    /**
     * 项目 schema 类 constructor
     *
     * @constructor
     * @param {string} schemaFilePath schema 文件路径
     * @param {Object} mocks Customizing mock data Object，用于之后为 schema 生成 mockServer 设置自定义 mock 数据使用
     */
    constructor(schemaFilePath, resolvers = {}, mocks = {}) {
        this.filePath = schemaFilePath;
        this.fileContent = readFileSync(this.filePath, 'UTF-8');
        this.schema = getGraphQLSchema(this.fileContent);
        this.executableSchema = getExecutableSchema(this.fileContent, resolvers);
        this.mockServer = getMockServer(this.fileContent, mocks);

        const mockQuery = 1;

        // const proxyInt = (value, root, args, context, info) => {
        //     console.log('value', value);
        //     console.log();
        //     console.log('root', root);
        //     console.log();
        //     console.log('args', args);
        //     console.log();
        //     console.log('context', context);
        //     console.log();
        //     console.log('info', info);
        //     console.log();
        //     // console.log(value, root, args, context, info);
        //     return value + 5;
        // };

        const proxyInt = {
            proxy: (root, args, context, info) => {
                // console.log(root, args, context, info);
                return mockQuery + 5;
            }
        }

        var mockFunctionMap = new Map();

        const defaultMockMap = new Map();
        // defaultMockMap.set('Int', function () {
        //     console.log(11111, arguments);
        //     console.log();
        //     console.log(arguments[0][arguments[3].fieldName].toString());
        //     return Math.round(Math.random() * 200) - 100;
        // });
        defaultMockMap.set('Int', proxyInt.proxy);

        defaultMockMap.set('Float', function () { return (Math.random() * 200) - 100; });
        defaultMockMap.set('String', function () {
            // console.log(arguments);
            return 'HHHHHHHH World';
        });
        defaultMockMap.set('Boolean', function () { return Math.random() > 0.5; });
        defaultMockMap.set('ID', function () { return 'IDIDIDIDIDID'; });
        const mockType = function (type, typeName, fieldName) {
            // order of precendence for mocking:
            // 1. if the object passed in already has fieldName, just use that
            // --> if it's a function, that becomes your resolver
            // --> if it's a value, the mock resolver will return that
            // 2. if the nullableType is a list, recurse
            // 2. if there's a mock defined for this typeName, that will be used
            // 3. if there's no mock defined, use the default mocks for this type
            return (root, args, context, info) => {
                // nullability doesn't matter for the purpose of mocking.
                const fieldType = getNullableType(type);
                const namedFieldType = getNamedType(fieldType);
                // console.log(fieldName, fieldType.name, root[fieldName].toString());
                // console.log(root, args, info);
                // console.log(fieldType, fieldType.name);

                if (defaultMockMap.has(fieldType.name)) {
                    return defaultMockMap.get(fieldType.name)(root, args, context, info);
                }
                console.log(fieldType.name);
                console.log();
                console.log(mockFunctionMap);
                console.log();
                if (mockFunctionMap.has(fieldType.name)) {
                    return mockFunctionMap.get(fieldType.name)(root, args, context, info);
                }
                return {
                    x: 1
                };
            };
        };

        const me = this;

        // forEachField(me.executableSchema, function (field, typeName, fieldName) {
        //     // console.log('field', field);
        //     // console.log('typeName', typeName);
        //     // console.log('fieldName', fieldName);
        //     // mockFunctionMap.set(typeName, function () {
        //     //     console.log(arguments);
        //     //     return (+new Date);
        //     // });
        //     var mockResolver;
        //     var isOnQueryType = me.executableSchema.getQueryType() ? (me.executableSchema.getQueryType().name === typeName) : false;
        //     var isOnMutationType = me.executableSchema.getMutationType() ? (me.executableSchema.getMutationType().name === typeName) : false;
        //     if (isOnQueryType || isOnMutationType) {
        //         mockResolver = function (root, args, context, info) {
        //             var updatedRoot = root || {}; // TODO: should we clone instead?
        //             updatedRoot[fieldName] = function () { return Math.round(Math.random() * 200) - 100; };
        //             // XXX this is a bit of a hack to still use mockType, which
        //             // lets you mock lists etc. as well
        //             // otherwise we could just set field.resolve to rootMock()[fieldName]
        //             // it's like pretending there was a resolve function that ran before
        //             // the root resolve function.
        //             return mockType(field.type, typeName, fieldName)(updatedRoot, args, context, info);
        //         };
        //         // if (mockFunctionMap.has(typeName)) {
        //         //     var rootMock_1 = mockFunctionMap.get(typeName);
        //         //     // XXX: BUG in here, need to provide proper signature for rootMock.
        //         //     if (rootMock_1(undefined, {}, {}, {})[fieldName]) {
        //         //         // TODO: assert that it's a function
        //         //         mockResolver = function (root, args, context, info) {
        //         //             var updatedRoot = root || {}; // TODO: should we clone instead?
        //         //             updatedRoot[fieldName] = rootMock_1(root, args, context, info)[fieldName];
        //         //             // XXX this is a bit of a hack to still use mockType, which
        //         //             // lets you mock lists etc. as well
        //         //             // otherwise we could just set field.resolve to rootMock()[fieldName]
        //         //             // it's like pretending there was a resolve function that ran before
        //         //             // the root resolve function.
        //         //             return mockType(field.type, typeName, fieldName)(updatedRoot, args, context, info);
        //         //         };
        //         //     }
        //         // }
        //     }

        //     if (!mockResolver) {
        //         mockResolver = mockType(field.type, typeName, fieldName);
        //     }
        //     field.resolve = mockResolver;
        // });

        const defaultScalarMap = new Map();
        // defaultScalarMap.set('Int', function (root, args, context, info) {
        //     if (proxy.Int) {
        //         return proxy.Int;
        //     }
        //     return Math.round(Math.random() * 200) - 100;
        // });

        还缺类型判断以及页面传来的 path 路径，避免设置一个 Int 导致所有的 Int 都是同样的值
        defaultScalarMap.set('Int', (root, args, context, info) => {
            const curStrategy = strategy['Int'];
            if (!curStrategy.resolve) {
                return curStrategy.execute(root, args, context, info);
            }
            return curStrategy.execute(root, args, context, info, curStrategy.resolve);
        });

        forEachField(me.executableSchema, (field, typeName, fieldName) => {
            const isOnQueryType = me.executableSchema.getQueryType() ? (me.executableSchema.getQueryType().name === typeName) : false;
            const isOnMutationType = me.executableSchema.getMutationType() ? (me.executableSchema.getMutationType().name === typeName) : false;
            const fieldType = getNullableType(field.type);
            const namedFieldType = getNamedType(fieldType);
            const oldResolve = fieldName.resolve;
            field.oldResolve = oldResolve;
            field.resolve = (root, args, context, info) => {
                delete info.schema;
                // console.log(field, fieldType.name);
                if (defaultScalarMap.has(fieldType.name)) {
                    return defaultScalarMap.get(fieldType.name)(root, args, context, info);
                }
                // console.log('typeName', typeName);
                // console.log('fieldName', fieldName);
                // console.log(JSON.stringify(info, null, 2));
                // console.log();
                return 'x';
            };
            // console.log('field', field);
            // console.log('typeName', typeName);
            // console.log('fieldName', fieldName);
            // console.log('fieldType', fieldType);
            // console.log('fieldType.name', fieldType.name, namedFieldType.name);
            // console.log('namedFieldType', namedFieldType);
            // console.log();

            // console.log('GraphQLScalarType', fieldType instanceof GraphQLScalarType);
            // console.log('NamedType GraphQLScalarType', namedFieldType instanceof GraphQLScalarType);
            // console.log();

            // console.log('GraphQLNonNull', fieldType instanceof GraphQLNonNull);
            // console.log('NamedType GraphQLNonNull', namedFieldType instanceof GraphQLNonNull);
            // console.log();

            // // GraphQLList 时需要继续 instanceof namedFieldType
            // console.log('GraphQLList', fieldType instanceof GraphQLList);
            // console.log('NamedType GraphQLList', namedFieldType instanceof GraphQLList);
            // console.log();

            // console.log('GraphQLObjectType', fieldType instanceof GraphQLObjectType);
            // console.log('NamedType GraphQLObjectType', namedFieldType instanceof GraphQLObjectType);
            // console.log();

            // console.log('GraphQLUnionType', fieldType instanceof GraphQLUnionType);
            // console.log('NamedType GraphQLUnionType', namedFieldType instanceof GraphQLUnionType);
            // console.log();

            // console.log('GraphQLInterfaceType', fieldType instanceof GraphQLInterfaceType);
            // console.log('NamedType GraphQLInterfaceType', namedFieldType instanceof GraphQLInterfaceType);
            // console.log();

            // console.log('GraphQLEnumType', fieldType instanceof GraphQLEnumType);
            // console.log('NamedType GraphQLEnumType', namedFieldType instanceof GraphQLEnumType);
            // console.log();

            // console.log('GraphQLInputObjectType', fieldType instanceof GraphQLInputObjectType);
            // console.log('NamedType GraphQLInputObjectType', namedFieldType instanceof GraphQLInputObjectType);
            // console.log();

            // console.log();


            // field.resolve = function (root, args, context, info) {
            //     console.log('field', field);
            // console.log('typeName', typeName);
            // console.log('fieldName', fieldName);
            //     console.log(root, args, context, info);
            //     // const updatedRoot = root || {}; // TODO: should we clone instead?
            //     // updatedRoot[fieldName] = function () {};
            //     // // // XXX this is a bit of a hack to still use mockType, which
            //     // // // lets you mock lists etc. as well
            //     // // // otherwise we could just set field.resolve to rootMock()[fieldName]
            //     // // // it's like pretending there was a resolve function that ran before
            //     // // // the root resolve function.
            //     // return mockType(field.type, typeName, fieldName)(updatedRoot, args, context, info);
            // }
            // console.log('isOnQueryType', isOnQueryType);
            // console.log('isOnMutationType', isOnMutationType);
            // console.log('fieldType', fieldType);
            // console.log('namedFieldType', namedFieldType);
            // console.log();
        });
    }

    /**
     * mockServer 查询
     *
     * @param {string} queryStr 查询字符串
     */
    mockServerQuery(queryStr, params = {}) {
        return this.mockServer.query(queryStr, params);
    }

}
