/**
 * @file core 模块
 * @author ielgnaw(wuji0223@gmail.com)
 */

import {existsSync, statSync, writeFileSync, readFileSync} from 'fs';
import {join, resolve} from 'path';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';
import chalk from 'chalk';
import {parse, printSchema, typeFromAST, findBreakingChanges, printIntrospectionSchema} from 'graphql';

import CONSTANT from '../conf/constant';
import {getEndpointSchema, diffSchema} from './graphql';
import * as info from './info';

/**
 * 创建配置信息的文件
 *
 * @param {Object} argv 命令行过来的参数
 * @param {string} dir 目录
 */
export function createMetadataConfFile(argv, dir) {
    const graphqlFile = join(process.cwd(), argv.schema);
    if (!existsSync(graphqlFile)) {
        console.log(chalk.red.bold('The schema file is not exists.'));
        rimraf.sync(dir);
        process.exit(1);
    }

    const config = {
        schemaFile: graphqlFile,
        endpointUrl: argv.endpoint || '',
        port: argv.port || ''
    };

    // 把项目配置信息写入 metadata.json
    writeFileSync(join(dir, CONSTANT.META_DATA_FILE), JSON.stringify(config, null, 4), 'UTF-8');
}

/**
 * local GraphQLSchema 对象写入 local.json
 * endpoint GraphQLSchema 对象写入 endpoint.json
 * 把这俩的 diff 结果写入 diff.json
 */
export async function createConf(cur) {
    writeFileSync(
        join(cur.infoDir, CONSTANT.LOCAL_SCHEMA),
        JSON.stringify(parse(cur.schemaInfo.fileContent), null, 4),
        'UTF-8'
    );

    if (!cur.endpointUrl) {
        return;
    }

    let endpointSchema = null;
    try {
        endpointSchema = await getEndpointSchema(cur.endpointUrl);
    }
    catch (e)  {
        console.log(chalk.red.bold(`Please check your endpoint schema: \n${e}`));
        process.exit(1);
    }

    // endpoint GraphQLSchema AST 对象写入 endpoint.json
    writeFileSync(
        join(cur.infoDir, CONSTANT.ENDPOINT_SCHEMA),
        JSON.stringify(parse(printSchema(endpointSchema)), null, 4),
        'UTF-8'
    );

    // console.log(typeFromAST(parse(printSchema(endpointSchema))));


    // local 和 endpoint schema 的对比结果
    // const diffRet = diffSchema(cur.schemaInfo.schema, endpointSchema) || {};
    const diffRet = diffSchema(parse(cur.schemaInfo.fileContent), parse(printSchema(endpointSchema))) || {};
    // 对比结果写入 diff.json
    writeFileSync(join(cur.infoDir, CONSTANT.DIFF_RESULT), JSON.stringify(diffRet, null, 4), 'UTF-8');
}

/**
 * 创建项目信息文件夹，init 命令过来执行
 * 如果是 run 命令，那么执行另外一个方法
 *
 * @param {Object} argv 命令行过来的参数
 * @param {string} dir 要生成项目信息文件夹的目录
 *
 * @return {Object} 项目 Info 实例
 */
export function createDir(argv = {}, dir = process.cwd()) {
    let curInfo = getInfoFromConf();
    // 为 null 说明还没有创建项目配置文件
    if (curInfo) {
        if (!argv.endpoint) {
            rimraf.sync(join(curInfo.infoDir, CONSTANT.ENDPOINT_SCHEMA));
            rimraf.sync(join(curInfo.infoDir, CONSTANT.DIFF_RESULT));
            curInfo.endpointUrl = '';
        }
        createConf(curInfo);
        return curInfo;
    }

    const infoDir = resolve(dir, CONSTANT.PROJECT_DIR);
    mkdirp.sync(infoDir);

    createMetadataConfFile(argv, infoDir);

    curInfo = getInfoFromConf(dir);
    createConf(curInfo);

    return curInfo;
}

/**
 * 获取项目信息
 *
 * @param {string=} dir 目录路径
 *
 * @return {string}
 */
export function getInfoFromConf(dir = process.cwd()) {
    if (existsSync(dir) && statSync(dir).isDirectory()) {
        while (dir) {
            // 查找当前目录下是否存在项目 .cographql 目录
            const infoDir = resolve(dir, CONSTANT.PROJECT_DIR);
            if (existsSync(infoDir) && statSync(infoDir).isDirectory()) {
                // 查找 .cographql 目录里是否有 metadata.json 配置文件
                const metaDataPath = join(infoDir, CONSTANT.META_DATA_FILE);
                if (existsSync(metaDataPath)) {
                    const metaData = JSON.parse(readFileSync(metaDataPath, 'UTF-8'));
                    const curInfo = info.setInfo(
                        Object.assign({
                            dir: dir,
                            infoDir: infoDir
                        }, metaData)
                    );
                    return curInfo;
                }
                // 有 .cographql 文件夹但是没有 metadata.json 文件，也返回 null
                return null;
            }
            // 向上查找目录
            const parentPath = resolve(dir, '..');
            if (parentPath === dir) {
                break;
            }
            dir = parentPath;
        }
    }
    return null;
}

export * from './info';
export * from './proxy';
export * from './query';
