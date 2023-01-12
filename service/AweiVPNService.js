'use strict';

const Utils = require('oen-utils');
const fetch = require('node-fetch');

const Chrome = require('../common/chrome');
const Request = require('../common/request');

const AWEI_HOME_URL = "https://www.youtube.com/@youtube-aweikeji/videos";

class AweiVPNService {

    buildYoutubeUrl(url) {
        let newUrl = 'https://www.youtube.com';
        if (!url.startsWith("/")) {
            newUrl = newUrl + "/";
        }
        return newUrl + url;
    }

    async _get_latest_video() {
        let mainBodySelector = "body > ytd-app > div[id=content] > ytd-page-manager > ytd-browse > ytd-two-column-browse-results-renderer > div[id=primary] > ytd-rich-grid-renderer > div[id=contents] > ytd-rich-grid-row > div[id=contents] > ytd-rich-item-renderer > div[id=content] > ytd-rich-grid-media > div[id=dismissible]";
        let { $, selector } = await Chrome.downSelector(AWEI_HOME_URL, mainBodySelector);
        if (Utils.isEmpty($) || Utils.isEmpty(selector)) {
            console.log("Not fount ", mainBodySelector);
            return null;
        }

        var nodes = selector.find("div[id=details] > div[id=meta] > h3 > a[id=video-title-link]");
        if (nodes && nodes.length < 1) {
            return null;
        }

        let node = $(nodes[0]);
        let url = this.buildYoutubeUrl(Utils.trimToOne(node.attr("href")));
        console.log(node.text());
        return url;
    }

    async _get_down_load_info(url) {
        let mainBodySelector = "body > ytd-app > div[id=content] > ytd-page-manager > ytd-watch-flexy > div[id=columns] > div[id=primary] > div[id=primary-inner] > div[id=below] > ytd-watch-metadata > div[id=above-the-fold]";
        let eventList = [{
            sleep: 10000,
            selector: 'tp-yt-paper-button[id=expand]',
            type: 'click',
        }, {
            sleep: 2000,
            selector: 'div[id=top-row] > div[id=actions] > div[id=actions-inner] > div[id=menu] > ytd-menu-renderer > yt-button-shape[id=button-shape] > button > yt-touch-feedback-shape > div > div[class=yt-spec-touch-feedback-shape__fill]',
            type: 'click',
        }, {
            sleep: 15000,
            selector: 'ytd-popup-container> tp-yt-iron-dropdown > div[id=contentWrapper] > ytd-menu-popup-renderer > tp-yt-paper-listbox[id=items] > ytd-menu-service-item-renderer:nth-child(2) > tp-yt-paper-item',
            type: 'click',
        }]


        let { $, selector } = await Chrome.downSelector(url, mainBodySelector, eventList);
        if (Utils.isEmpty($) || Utils.isEmpty(selector)) {
            console.log("Not found");
            return null;
        }
        let descNode = $("#description-inline-expander");
        let descAs = descNode.find("yt-formatted-string > a");
        let lzUrl = null;
        if (descAs) {
            descAs.each((i, ele) => {
                let node = $(ele);
                let txt = node.text();
                if (txt.includes("https://wwhb.lanzoux.com/")) {
                    lzUrl = txt;
                }
            });
        }

        let transcript = $("div[id=content] > ytd-transcript-renderer > div[id=content] > ytd-transcript-search-panel-renderer> div[id=body] > ytd-transcript-segment-list-renderer");
        let trList = transcript.find("div[id=segments-container] > ytd-transcript-segment-renderer");
        let lzUrlPassword = null;
        let reg = /\d{3}/;
        if (trList) {
            trList.each((i, ele) => {
                let node = $(ele);
                let txt = Utils.trimToOne(node.text());
                if (txt.includes("密码") && txt.includes("网盘") && txt.search(reg) > 0) {
                    let regRes = reg.exec(txt);
                    lzUrlPassword = regRes[0];
                }
            });
        }

        if (lzUrl && lzUrlPassword) {
            return {
                lzUrl: lzUrl,
                lzPass: lzUrlPassword
            };
        }
        return null;
    }

    async _get_lzy_info(data) {
        let mainBodySelector = "body > div[id=pwdload]";
        let eventList = [{
            sleep: 3000,
            selector: 'body > div[id=pwdload] > input[name=pwd]',
            type: 'input',
            text: data.lzPass
        }, {
            sleep: 5000,
            selector: 'body > div[id=pwdload] > input[id=sub]',
            type: 'click',
        }]


        let { $, selector } = await Chrome.downSelector(data.lzUrl, mainBodySelector, eventList);
        if (Utils.isEmpty($) || Utils.isEmpty(selector)) {
            console.log("Not found");
            return null;
        }

        let infos = $("body > div[id=info] div[id=infos]");
        let nodes = infos.find("div[id=ready] > div[id=name] > a");
        let txtUrl = null;
        if (nodes) {
            nodes.each((i, ele) => {
                let node = $(ele);
                let txt = Utils.trimToOne(node.text());
                if (txt.includes("阿伟科技.txt")) {
                    txtUrl = "https://wwhb.lanzoux.com" + node.attr("href");
                }
            });
        }
        return txtUrl;
    }
    async _get_lzy_down_info(url) {
        let mainBodySelector = "body > div[class=d] > div[class=d2] > div[class=ifr] > iframe[class=ifr2]";
        let { $, frame } = await Chrome.downSelector(url, mainBodySelector, null, 'iframe[class=ifr2]');
        if (Utils.isEmpty($) || Utils.isEmpty(frame)) {
            console.log("Not found");
            return null;
        }
        let main = frame("body > div[id=tourl]");
        let a = main.find("a");
        return Utils.trimToOne(a.attr('href'));
    }

    async down_txt(url) {
        return await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/octet-stream;charset=UTF-8' },
        }).then(res => res.buffer()).then(buf => {
            // let txt = String.fromCharCode.apply(null, new Uint16Array(buf));
            let txt = buf.toString();
            console.log(txt);
            return txt;
        });
    }
    async down() {
        // let url = await this._get_latest_video();
        // if (!url) {
        //     console.log("Youtube Video can not found");
        //     return;
        // }
        // let url = "https://www.youtube.com/watch?v=nyb1wtw3xuM";
        // let data = await this._get_down_load_info(url);
        // if (!data) {
        //     console.log("Can not found lzy info by : " + url);
        //     return;
        // }
        // let txt_url = await this._get_lzy_info(data);
        // if (!txt_url) {
        //     console.log("Can not found txt file by : ", data);
        //     return;
        // }
        // let down_url = await this._get_lzy_down_info(txt_url);
        // if (!down_url) {
        //     console.log("Can not found txt down load url by : ", txt_url);
        //     return;
        // }
        let down_url = 'https://developer.lanzoug.com/file/?AmRbZQAxU2IBCFRsVmMBbVdoBj4DbVBiBjZauFy4UfpQJgdiD7dUjQDDAL4C3AKBBrtU01K0ADNReFBnUTxStgKNW7sAcFPuAc9UvVbmAbxXkgbkA/tQwwbnWtZcgFF+UCQHKA8mVCYAMAA/AjoCZgYDVDhSaQA/UW9QYVE9UmECOls9AGlTMQFxVGRWcQE9VzkGOwNpUGYGOVp6XHBRIFBtB2IPYlQyAGUAeQJmAjIGc1RgUjwALVFgUGdRPFJjAjFbPQBtUzMBYlRgVjMBN1c4BjQDOlA3BmVab1xlUTFQZAc1D2FUZQBlADACMgIyBmhUN1I6AGFReFAiUXVSJwIkW3kALlNiASVUa1ZmAT1XOgY0A29QYAYwWmxcJlEkUDkHPQ83VGYAawBnAmACNAZvVGRSPAA6UWNQZFE0Un0CLFsqADtTawEgVD9WMwE2VzoGMANpUGMGNlppXDFRaVB2ByUPIlR3AGsAZwJgAjQGb1RlUj4ANFFuUG9ROlJ1AndbZQAtUzoBZlQzVjUBLlc8BjADZVB8BjBab1wuUWFQYQdi';
        await this.down_txt(down_url);
    }
}

module.exports = AweiVPNService