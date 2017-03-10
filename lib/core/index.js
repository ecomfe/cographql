/**
 * @file core 模块
 * @author ielgnaw(wuji0223@gmail.com)
 */

import {existsSync, statSync, writeFileSync, readFileSync} from 'fs';
import {join, resolve} from 'path';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';
import chalk from 'chalk';

import CONSTANT from '../conf/constant';
import ProjectInfo from './project-info';
import Schema from './schema';
import {getEndpointSchema, diffSchema, getGraphQLSchema} from './graphql';

/**
 * 获取项目信息
 *
 * @param {string=} dir 目录路径
 *
 * @return {string}
 */
export function getProjectInfo(dir = process.cwd()) {
    if (existsSync(dir) && statSync(dir).isDirectory()) {
        while (dir) {
            // 查找当前目录下是否存在项目 info 目录
            const infoDir = resolve(dir, CONSTANT.PROJECT_DIR);
            if (existsSync(infoDir) && statSync(infoDir).isDirectory()) {
                const metaDataPath = join(infoDir, CONSTANT.META_DATA_FILE);
                if (existsSync(metaDataPath)) {
                    const metaData = JSON.parse(readFileSync(metaDataPath, 'UTF-8'));
                    const curProjInfo = new ProjectInfo(Object.assign({
                        dir: dir,
                        infoDir: infoDir
                    }, metaData));
                    return curProjInfo;
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
        schemaFile: graphqlFile,
        endpointUrl: argv.endpoint || '',
        address: argv.address || '',
        port: argv.port || ''
    };

    // 把项目配置信息写入 metadata.json
    writeFileSync(join(dir, CONSTANT.META_DATA_FILE), JSON.stringify(config, null, 4), 'UTF-8');

    // -s 传入的 schema
    // const localSchemaContent = readFileSync(graphqlFile, 'UTF-8');

    // 由 -s 传入的 schema 文件内容生成的 GraphQLSchema 对象
    // const localSchema = getGraphQLSchema(localSchemaContent);

    // 不传入 resolvers 的时候，getExecutableSchema 生成的 schema 和 localSchema 是一样的
    // console.log(JSON.stringify(getExecutableSchema(localSchemaContent, {
    //     Query: {
    //         posts() {
    //             return posts;
    //         },
    //         author(_, {id}) {
    //             return find(authors, {id: id});
    //         }
    //     }
    // }), null, 4));
    // console.log();
    // console.log(localSchema);

    // local GraphQLSchema 对象写入 local.json
    // writeFileSync(join(dir, CONSTANT.LOCAL_SCHEMA), JSON.stringify(localSchema, null, 4), 'UTF-8');

    // if (argv.endpoint) {
    //     let endpointSchema = null;
    //     try {
    //         endpointSchema = await getEndpointSchema(argv.endpoint);
    //     }
    //     catch (e)  {
    //         console.log(chalk.red.bold(`Please check your endpoint schema: \n${e}`));
    //         process.exit(1);
    //     }

    //     // endpoint GraphQLSchema 对象写入 endpoint.json
    //     writeFileSync(join(dir, CONSTANT.ENDPOINT_SCHEMA), JSON.stringify(endpointSchema, null, 4), 'UTF-8');

    //     // local 和 endpoint schema 的对比结果
    //     const diffRet = diffSchema(localSchema, endpointSchema) || {};
    //     // 对比结果写入 diff.json
    //     writeFileSync(join(dir, CONSTANT.DIFF_RESULT), JSON.stringify(diffRet, null, 4), 'UTF-8');
    // }

    // console.log('local <=> endpoint:\n');
    // console.log(findBreakingChanges(localSchema, endpointSchema))
    // console.log();
    // console.log('endpoint <=> local:\n');
    // console.log(findBreakingChanges(endpointSchema, localSchema));
    // console.log();
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
    const curProjInfo = getProjectInfo(dir);
    // 说明已经有 project info 了，理论上就是 run 命令
    if (curProjInfo) {
        return curProjInfo;
    }

    const infoDir = resolve(dir, CONSTANT.PROJECT_DIR);
    mkdirp.sync(infoDir);

    createConfFile(argv, infoDir);

    return getProjectInfo(dir);
}
