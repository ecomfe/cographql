/**
 * @file resolver proxy
 * @author ielgnaw(wuji0223@gmail.com)
 */

const intProxy = {
    // root,
    // args,
    // context,
    // info,
    execute: (root, args, context, info, resolve) => {
        if (resolve) {
            if (typeof resolve === 'function') {
                return resolve(root, args, context, info);
            }
            return resolve;
        }
        return 666;
    }
};

export default {
    Int: intProxy
}



// var calculateBouns = function(level,salary) { return obj[level](salary); };
