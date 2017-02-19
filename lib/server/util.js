/**
 * @file 通用方法
 * @author ielgnaw(wuji0223@gmail.com)
 */

import os from 'os';

export function getIP() {
    const ifaces = os.networkInterfaces();
    const defultAddress = '127.0.0.1';
    let ip = defultAddress;

    /* eslint-disable fecs-use-for-of, no-loop-func */
    for (const dev in ifaces) {
        if (ifaces.hasOwnProperty(dev)) {
            /* jshint loopfunc: true */
            ifaces[dev].forEach(details => {
                if (ip === defultAddress && details.family === 'IPv4') {
                    ip = details.address;
                }
            });
        }
    }
    /* eslint-enable fecs-use-for-of, no-loop-func */
    return ip;
}
