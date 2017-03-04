/**
 * @file 项目信息配置管理模块
 * @author ielgnaw(wuji0223@gmail.com)
 */

import {existsSync, statSync, writeFileSync, readFileSync} from 'fs';
import {join, resolve} from 'path';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';
import chalk from 'chalk';

import CONSTANT from '../conf/constant';
import {getEndpointSchema, getGraphQLSchema, diffSchema} from './graphql';

/**
 * 项目 info 类
 */
export class ProjectInfo {

    /**
     * 项目 info 类 constructor
     *
     * @constructor
     * @param {string} dir 项目目录
     * @param {string} infoDir 项目配置信息目录
     */
    constructor(dir, infoDir) {
        this.dir = dir;
        this.infoDir = infoDir;
    }
}

/**
 * 获取项目信息
 *
 * @param {string=} dir 目录路径
 * @return {string}
 */
export function getProjectInfo(dir = process.cwd()) {
    if (existsSync(dir) && statSync(dir).isDirectory()) {
        while (dir) {
            // 查找当前目录下是否存在项目 info 目录
            const infoDir = resolve(dir, CONSTANT.PROJECT_DIR);
            if (existsSync(infoDir) && statSync(infoDir).isDirectory()) {
                return new ProjectInfo(dir, infoDir);
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

/**
 * 创建配置信息的文件
 *
 * @param {Object} argv 命令行过来的参数
 * @param {string} dir 目录
 */
export async function createConfFile(argv, dir) {
    const graphqlFile = join(process.cwd(), argv.schema);
    if (!existsSync(graphqlFile)) {
        console.log(chalk.red.bold('The schema file is not exists.'));
        rimraf.sync(dir);
        process.exit(1);
    }

    const config = {
        schema: graphqlFile,
        devEndpoint: argv.endpoint || '',
        address: argv.address || '',
        port: argv.port || ''
    };

    // 把项目配置信息写入 metadata.json
    writeFileSync(join(dir, CONSTANT.META_DATA_FILE), JSON.stringify(config, null, 4), 'UTF-8');

    // -s 传入的 schema 文件内容
    const localSchemaFileContent = readFileSync(graphqlFile, 'UTF-8');

    // 由 -s 传入的 schema 文件内容生成的 GraphQLSchema 对象
    const localSchema = getGraphQLSchema(localSchemaFileContent);

    // local GraphQLSchema 对象写入 local.json
    writeFileSync(join(dir, CONSTANT.LOCAL_SCHEMA), JSON.stringify(localSchema, null, 4), 'UTF-8');

    if (argv.endpoint) {
        let endpointSchema = null;
        try {
            endpointSchema = await getEndpointSchema(argv.endpoint);
        }
        catch (e)  {
            console.log(chalk.red.bold(`Please check your endpoint schema: \n${e}`));
            process.exit(1);
        }

        // endpoint GraphQLSchema 对象写入 endpoint.json
        writeFileSync(join(dir, CONSTANT.ENDPOINT_SCHEMA), JSON.stringify(endpointSchema, null, 4), 'UTF-8');

        // local 和 endpoint schema 的对比结果
        const diffRet = diffSchema(localSchema, endpointSchema);
        // 对比结果写入 diff.json
        writeFileSync(join(dir, CONSTANT.DIFF_RESULT), JSON.stringify(diffRet, null, 4), 'UTF-8');
    }

    // console.log('local <=> endpoint:\n');
    // console.log(findBreakingChanges(localSchema, endpointSchema))
    // console.log();
    // console.log('endpoint <=> local:\n');
    // console.log(findBreakingChanges(endpointSchema, localSchema));
    // console.log();
}

/**
 * 创建项目信息文件夹
 *
 * @param {Object} argv 命令行过来的参数
 * @param {string} dir 要生成项目信息文件夹的目录
 *
 * @return {Object} 项目 Info 实例
 */
export function createDir(argv = {}, dir = process.cwd()) {
    let curProjInfo = getProjectInfo(dir);
    if (curProjInfo) {
        return curProjInfo;
    }

    const infoDir = resolve(dir, CONSTANT.PROJECT_DIR);
    mkdirp.sync(infoDir);

    curProjInfo = getProjectInfo(dir);

    createConfFile(argv, curProjInfo.infoDir);

    // const keep = join(curProjInfo.infoDir, '.gitkeep');
    // writeFileSync(keep, '# Please keep this file', 'UTF-8');

    return curProjInfo;
}

