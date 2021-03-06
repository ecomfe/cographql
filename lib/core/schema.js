/**
 * @file 当前项目 schema 模块
 * @author ielgnaw(wuji0223@gmail.com)
 */

import {readFileSync} from 'fs';

import {getExecutableSchema, getGraphQLSchema, getMockServer} from './graphql';

import {getOperationAST, parse} from 'graphql';

import {
    GraphQLObjectType,
    GraphQLList,
    getNullableType,
    getNamedType,
    visit,
    TypeInfo,
    visitWithTypeInfo
} from 'graphql';

// const test = `
//     {
//       author {
//         name
//       }
//     }
// `;

// // const typeInfo = new TypeInfo(test);
// // console.log(typeInfo);

// const ast = parse(test, { noLocation: true });
// console.log(JSON.stringify(ast, null, 2));
// console.log();

// let selectionSet;

// // visit(ast, visitWithTypeInfo(typeInfo, {
// //     enter(node) {
// //         const parentType = typeInfo.getParentType();
// //         const type = typeInfo.getType();
// //         const inputType = typeInfo.getInputType();
// //         console.log(
// //             'enter',
// //             node.kind,
// //             node.kind === 'Name' ? node.value : null,
// //             parentType ? String(parentType) : null,
// //             type ? String(type) : null,
// //             inputType ? String(inputType) : null
// //         );
// //     },
// //     leave(node) {
// //         const parentType = typeInfo.getParentType();
// //         const type = typeInfo.getType();
// //         const inputType = typeInfo.getInputType();
// //         console.log(
// //             'leave',
// //             node.kind,
// //             node.kind === 'Name' ? node.value : null,
// //             parentType ? String(parentType) : null,
// //             type ? String(type) : null,
// //             inputType ? String(inputType) : null
// //         );
// //     }
// // }));

// const editedAst = visit(ast, {
//     OperationDefinition: {
//         enter(node) {
//             selectionSet = node.selectionSet;
//             return {
//                 ...node,
//                 selectionSet1: {
//                     kind: 'SelectionSet',
//                     cc: 2,
//                     selections: []
//                 },
//                 didEnter: true,
//             };
//         },
//         leave(node) {
//             return {
//                 ...node,
//                 selectionSet,
//                 didLeave: true,
//             };
//         }
//     }
// });

// console.log('edited: ', JSON.stringify(editedAst, null, 2));
// console.log();

import {forEachField} from 'graphql-tools';

import * as core from './';

const mockType = (type, typeName, fieldName) => {
    return (root, args, context, info) => {
        const fieldType = getNullableType(type);
        const namedFieldType = getNamedType(fieldType);
        // 暂时不处理带有 root, GraphQLUnionType, GraphQLInterfaceType, GraphQLEnumType 的情况

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

        if (fieldType instanceof GraphQLList) {
            return [
                mockType(fieldType.ofType)(root, args, context, info),
                mockType(fieldType.ofType)(root, args, context, info),
                mockType(fieldType.ofType)(root, args, context, info),
                mockType(fieldType.ofType)(root, args, context, info)
            ];
        }
        if (fieldType instanceof GraphQLObjectType) {
            return {};
        }
        if (core.proxy.defaultScalarMap.has(fieldType.name)) {
            return core.proxy.defaultScalarMap.get(fieldType.name)(root, args, context, info);
        }


        return Error(`No mock defined for type "${fieldType.name}"`);
    };
};

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
        // console.log('local', JSON.stringify(parse(this.fileContent), null, 2));
        // console.log(111, getOperationAST(parse(this.fileContent)));
        // console.log();

        forEachField(this.executableSchema, (field, typeName, fieldName) => {
            const isOnQueryType = this.executableSchema.getQueryType()
                ? (this.executableSchema.getQueryType().name === typeName)
                : false;
            const isOnMutationType = this.executableSchema.getMutationType()
                ? (this.executableSchema.getMutationType().name === typeName)
                : false;
            const fieldType = getNullableType(field.type);
            const namedFieldType = getNamedType(fieldType);
            const oldResolve = fieldName.resolve;
            field.oldResolve = oldResolve;
            field.resolve = mockType(field.type, typeName, fieldName);
        });

        this.mockServer = getMockServer(this.fileContent, mocks);
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
