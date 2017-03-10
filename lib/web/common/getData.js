/**
 * @file getData 获取数据
 * @author li ang(liang07@baidu.com)
 */

// mock数据
import graphqlData from '../mock/graphqlData';

const __schema = graphqlData.data.__schema;

const getData = (type) => {
    var result  = [];
    var item = __schema[type];

    if (item) {
        result.push(item);
    }
    else {
        for (var i in __schema) {
            if (__schema.hasOwnProperty(i)) {
                result.push(__schema[i]);
            }
        }
    }

    return result;
};

export default getData;