/**
 * @file 项目信息配置管理模块
 * @author ielgnaw(wuji0223@gmail.com)
 */

import {existsSync, statSync, writeFileSync} from 'fs';
import {join, resolve} from 'path';
import mkdirp from 'mkdirp';

import CONSTANT from '../conf/constant';

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
 * 创建项目信息文件夹
 *
 * @return {Object} 项目 Info 实例
 */
export function createDir(dir = process.cwd()) {
    let curProjInfo = getProjectInfo(dir);
    if (curProjInfo) {
        return curProjInfo;
    }

    const infoDir = resolve(dir, CONSTANT.PROJECT_DIR);
    mkdirp.sync(infoDir);

    curProjInfo = getProjectInfo(dir);

    const keep = join(curProjInfo.infoDir, '.gitkeep');
    writeFileSync(keep, '# Please keep this file', 'UTF-8');

    return curProjInfo;
}

