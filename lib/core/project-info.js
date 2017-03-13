/**
 * @file 项目信息配置管理模块
 * @author ielgnaw(wuji0223@gmail.com)
 */

import {existsSync, statSync, writeFileSync, readFileSync} from 'fs';
import {join, resolve} from 'path';
import chalk from 'chalk';

import CONSTANT from '../conf/constant';
import Schema from './schema';
import {getEndpointSchema, diffSchema} from './graphql';

/**
 * 项目 info 类
 */
export default class ProjectInfo {

    /**
     * 项目 info 类 constructor
     *
     * @constructor
     * @param {string} dir 项目目录
     * @param {string} infoDir 项目配置信息目录
     */
    constructor({dir, infoDir, schemaFile, endpointUrl, address, port}) {
        this.dir = dir;
        this.infoDir = infoDir;
        this.schemaFile = schemaFile;
        this.endpointUrl = endpointUrl;
        this.address = address;
        this.port = port;

        if (!this.schemaInfo) {
            this.schemaInfo = new Schema(this.schemaFile);
        }

        this.writeLocalSchema();

        if (this.endpointUrl) {
            this.writeEndpoint();
        }
    }

    /**
     * local GraphQLSchema 对象写入 local.json
     */
    writeLocalSchema(schema = this.schemaInfo.schema) {
        writeFileSync(
            join(this.infoDir, CONSTANT.LOCAL_SCHEMA),
            JSON.stringify(schema, null, 4),
            'UTF-8'
        );
    }

    /**
     * endpoint GraphQLSchema 对象写入 endpoint.json
     */
    async writeEndpoint(url = this.endpointUrl) {
        let endpointSchema = null;
        try {
            endpointSchema = await getEndpointSchema(url);
        }
        catch (e)  {
            console.log(chalk.red.bold(`Please check your endpoint schema: \n${e}`));
            process.exit(1);
        }

        // endpoint GraphQLSchema 对象写入 endpoint.json
        writeFileSync(join(this.infoDir, CONSTANT.ENDPOINT_SCHEMA), JSON.stringify(endpointSchema, null, 4), 'UTF-8');

        // local 和 endpoint schema 的对比结果
        const diffRet = diffSchema(this.schemaInfo.schema, endpointSchema) || {};
        // 对比结果写入 diff.json
        writeFileSync(join(this.infoDir, CONSTANT.DIFF_RESULT), JSON.stringify(diffRet, null, 4), 'UTF-8');
    }
}
