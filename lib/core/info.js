/**
 * @file 当前项目的 info 信息
 *       每次启动时，根据 .cographql 里的配置文件信息来填充这个里面的数据，保持运行期间只有一个 info
 * @author ielgnaw(wuji0223@gmail.com)
 */

import Schema from './schema';

const info = {
    // 当前项目目录
    dir: '',
    // 当前项目 .cographql 配置文件目录
    infoDir: '',
    // 当前执行的 schema 文件路径
    schemaFile: '',
    // 当前执行的远程 endpoint 地址
    endpointUrl: '',
    // 当前执行的 schema 对象，根据 schemaFile 生成
    schemaInfo: null
};

/**
 * 当前配置是否可用，即 schema 字段是否为空，为空不可用，需要设置
 *
 * @return {boolean} 结果
 */
function isValid() {
    return !!info.schemaInfo;
}

export function getInfo() {
    if (!isValid()) {
        return null;
    }
    return info;
}

export function setInfo(args) {
    Object.assign(info, args);
    if (args.schemaFile) {
        info.schemaInfo = new Schema(args.schemaFile);
    }
    return getInfo();
}
