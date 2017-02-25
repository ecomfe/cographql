/**
 * @file graphql 相关的模块
 * @author ielgnaw(wuji0223@gmail.com)
 */

import {parse} from 'graphql';

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
