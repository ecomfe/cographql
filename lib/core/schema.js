/**
 * @file 当前项目 schema 模块
 * @author ielgnaw(wuji0223@gmail.com)
 */

import {readFileSync} from 'fs';
import {graphql} from 'graphql';

import {getExecutableSchema, getGraphQLSchema, getMockServer} from './graphql';

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
