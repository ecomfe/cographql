/**
 * @file 当前项目 schema 模块
 * @author ielgnaw(wuji0223@gmail.com)
 */

import {existsSync, statSync, writeFileSync, readFileSync} from 'fs';
import {parse, introspectionQuery, buildSchema, buildClientSchema} from 'graphql';
import {makeExecutableSchema, addMockFunctionsToSchema, MockList, mockServer} from 'graphql-tools';

/**
 * 项目 schema 类
 */
export default class SchemaInfo {

    /**
     * 项目 schema 类 constructor
     *
     * @constructor
     * @param {string} schemaFilePath schema 文件路径
     */
    constructor(schemaFilePath) {
        this.filePath = schemaFilePath;
        this.fileContent = readFileSync(this.filePath, 'UTF-8');
        this.schema = buildSchema(this.fileContent);
    }

    /**
     * 获取 executableSchema
     *
     * @param {string} schemaFileContent schema 文件内容
     * @param {Object?} resolvers resolver 对象
     *
     * @return {Object} executableSchema
     */
    getExecutableSchema(schemaFileContent = this.fileContent, resolvers = {}) {
        return makeExecutableSchema({
            typeDefs: schemaFileContent,
            resolvers: resolvers
        });
    }

}
