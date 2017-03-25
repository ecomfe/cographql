/**
 * @file graphql 相关的模块
 * @author ielgnaw(wuji0223@gmail.com)
 */

import fetch from 'node-fetch';
import diff from 'deep-diff';
import {parse, introspectionQuery, buildSchema, buildClientSchema, buildASTSchema, printSchema, getOperationAST} from 'graphql';
import {makeExecutableSchema, addMockFunctionsToSchema, mockServer, MockList} from 'graphql-tools';

/**
 * 根据 graphql 文件内容获取 ast
 *
 * @param {string} graphqlFileContent graphql 文件内容
 *
 * @return {Object} ast 对象
 */
export function getAst(graphqlFileContent) {
    return parse(graphqlFileContent);
}

/**
 * 根据文件内容获取 GraphQLSchema 对象
 *
 * @param {string} fileContent graphql 文件内容
 *
 * @return {Object} GraphQLSchema 对象
 */
export function getGraphQLSchema(fileContent) {
    return buildSchema(fileContent);
}

/**
 * 获取远程的 endpoint 文件的 GraphQLSchema 对象
 *
 * @param {string} endpointUrl 远程地址
 *
 * @return {Promise} Promise 对象，resolve 之后是 GraphQLSchema 对象
 */
export async function getEndpointSchema(endpointUrl) {
    const response = await fetch(endpointUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            query: introspectionQuery
        })
    });

    const {data, errors} = await response.json();
    console.log(printSchema(buildClientSchema(data)));
    // console.log(JSON.stringify(parse(printSchema(buildClientSchema(data))), null, 2));

    if (errors) {
        throw new Error(JSON.stringify(errors, null, 4));
    }

    return buildClientSchema(data);
}


/**
 * 比较 GraphQLSchema
 *
 * @param {Object} local 本地 GraphQLSchema 对象
 * @param {Object} endpoint endpoint GraphQLSchema 对象
 * @param {boolean} reverse 是否反向，diff 参数顺序不同，结果不同，默认 local => left, endpoint => right
 *
 * @return {Object} 比较结果
 */
export function diffSchema(local, endpoint, reverse) {
    let left;
    let right;

    reverse
        ? (
            left = endpoint,
            right = local
        )
        : (
            left = local,
            right = endpoint
        );

    // 先 stringify 再 parse 是为了去掉对象中不必要的信息
    return diff(JSON.parse(JSON.stringify(left)), JSON.parse(JSON.stringify(right)));
}

/**
 * 获取 executableSchema
 *
 * @param {string} schemaFileContent schema 文件内容
 * @param {Object?} resolvers resolver 对象
 *
 * @return {Object} executableSchema
 */
export function getExecutableSchema(schemaFileContent, resolvers = {}) {
    return makeExecutableSchema({
        typeDefs: schemaFileContent,
        resolvers: resolvers
    });
}

/**
 * 获取当前 schema 的 mockServer 对象
 *
 * @param {Object|string} schema schema 对象或者 schema 文件内容
 * @param {Object} mocks Customizing mock data Object
 *
 * @return {Object} mockServer 对象
 */
export function getMockServer(schema, mocks = {}) {
    return mockServer(schema, mocks);
}
