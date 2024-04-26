'use strict';

const Utils = require('oen-utils');
const Request = require('./common/request');
const fetch = require('node-fetch');

const domain_list = [
    { "url": "https://sub.sharecentre.online/sub", "base64": true },
    { "url": "https://raw.githubusercontent.com/mahdibland/V2RayAggregator/master/sub/splitted/vmess.txt", "base64": false },
    { "url": "https://raw.githubusercontent.com/mahdibland/V2RayAggregator/master/sub/splitted/trojan.txt", "base64": false },
    { "url": "https://raw.githubusercontent.com/peasoft/NoMoreWalls/master/list_raw.txt", "base64": false },
    { "url": "https://raw.githubusercontent.com/ermaozi/get_subscribe/main/subscribe/v2ray.txt", "base64": true },
    { "url": "https://raw.githubusercontent.com/aiboboxx/v2rayfree/main/v2", "base64": true },
    { "url": "https://raw.githubusercontent.com/freefq/free/master/v2", "base64": true },
    { "url": "https://raw.githubusercontent.com/Pawdroid/Free-servers/main/sub", "base64": true },
    { "url": "https://raw.githubusercontent.com/w1770946466/Auto_proxy/main/Long_term_subscription1", "base64": true },
    { "url": "https://raw.githubusercontent.com/w1770946466/Auto_proxy/main/Long_term_subscription2", "base64": true },
    { "url": "https://raw.githubusercontent.com/w1770946466/Auto_proxy/main/Long_term_subscription3", "base64": true },
    { "url": "https://raw.githubusercontent.com/w1770946466/Auto_proxy/main/Long_term_subscription4", "base64": true },
    { "url": "https://raw.githubusercontent.com/w1770946466/Auto_proxy/main/Long_term_subscription5", "base64": true },
    { "url": "https://raw.githubusercontent.com/w1770946466/Auto_proxy/main/Long_term_subscription6", "base64": true },
    { "url": "https://raw.githubusercontent.com/w1770946466/Auto_proxy/main/Long_term_subscription7", "base64": true },
    { "url": "https://raw.githubusercontent.com/w1770946466/Auto_proxy/main/Long_term_subscription8", "base64": true },
];


async function fetchByLink(link, isBase64) {
    if (!link) {
        return [];
    }
    let data = await fetch(link, { method: 'GET' }).then(res => res.text()).then(text => text).catch(reason => { console.error(reason); return null; });
    if (isBase64) {
        try {
            data = Buffer.from(data, 'base64').toString('utf8');
        } catch (e) {
            console.error(data, e);
        }
    }
    return data.split("\n");
}

(async () => {
    for (let domain of domain_list) {
        try {
            let list = [];
            let ss = await fetchByLink(domain.url, domain.base64);
            for (let s of ss) {
                if (s && s.length > 10 && !list.includes(s)) {
                    list.push(s);
                }
            }
            Utils.safeRun(() => {
                Request.postWithAction("/front/vpn/proxy/add-links", {
                    key: '123',
                    links: list
                });
            });
        } catch (e) {
            console.error(JSON.stringify(domain), e);
        }
    }
})();