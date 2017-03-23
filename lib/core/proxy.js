/**
 * @file resolver proxy
 * @author ielgnaw(wuji0223@gmail.com)
 */

import uuid from 'uuid';

const SCALAR_TYPE = [
    {
        type: 'Int',
        defaultVal: 666 // Math.round(Math.random() * 200) - 100
    },
    {
        type: 'Float',
        defaultVal: (Math.random() * 200) - 100
    },
    {
        type: 'String',
        defaultVal: 'Hello CoGraphQL'
    },
    {
        type: 'Boolean',
        defaultVal: Math.random() > 0.5
    },
    {
        type: 'ID',
        defaultVal: uuid.v4()
    }
];

const curResolve = {};
const defaultScalarMap = new Map();

SCALAR_TYPE.forEach(item => {
    curResolve[item.type] = {
        defaultVal: item.defaultVal,
        execute: (root, args, context, info, resolve) => {
            if (resolve) {
                if (typeof resolve === 'function') {
                    return resolve(root, args, context, info);
                }
                return resolve;
            }
            return item.defaultVal;
        }
    };
    defaultScalarMap.set(item.type, (root, args, context, info) => {
        const curStrategy = curResolve[item.type];
        if (!curStrategy.resolve) {
            return curStrategy.execute(root, args, context, info);
        }
        return curStrategy.execute(root, args, context, info, curStrategy.resolve);
    });
});

export const proxy = {
    proxy: curResolve,
    defaultScalarMap: defaultScalarMap,
    cache: {}
};
