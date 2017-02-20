/**
 * @file ajax 请求封装
 * @author ielgnaw(wuji0223@gmail.com)
 */

import reqwest from 'reqwest';

export async function get(url, data = {}) {
    try {
        const ret = await reqwest({
            url: url,
            method: 'get',
            type: 'json',
            contentType: 'application/json',
            crossOrigin: true,
            withCredentials: true,
            data: data
        });
        if (ret.status !== 0) {
            alert(`Error in ${ret.type}：${ret.statusInfo}`);
            return null;
        }
        return ret;
    }
    catch (e) {
        alert(e);
    }
}

export async function post(url, data = {}) {
    try {
        const ret = await reqwest({
            url: url,
            method: 'post',
            data: data
        });
        if (ret.status !== 0) {
            alert(`Error in ${ret.type}：${ret.statusInfo}`);
            return null;
        }
        return ret;
    }
    catch (e) {
        alert(e);
    }
}

