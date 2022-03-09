'use strict';

const fetch = require('node-fetch');

class Request {
    static async post(url, token, data) {
        return await fetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
            data: data,
            headers: { 'Content-Type': 'application/json', 'ALADDIN_LAMP_TOKEN': token },
        }).then((res) => res.json())
            .then((res) => {
                console.log(res);
            })
            .catch((e) => {
                console.error(e)
            });
    }

    static async postWithBase(type, data) {
        let BASE_URL = process.env.BASE_URL;

        if (!BASE_URL) {
            console.error("未配置提交地址，提交失败！");
            return null;
        }

        let HEADER_TOKEN = process.env.HEADER_TOKEN;

        if (!HEADER_TOKEN) {
            console.error("未配置提交认证TOKEN，提交失败！");
            return null;
        }
        let json = JSON.stringify(data);
        console.log("Post Type: " + type + " : " + json)
        return await Request.post(BASE_URL, HEADER_TOKEN, { type: type, data: json })
    }
}

module.exports = Request