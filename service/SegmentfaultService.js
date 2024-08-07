'use strict';

const BASE_URL = "https://segmentfault.com";
const Utils = require('oen-utils');
const UUID = require('oen-uuid');
const Chrome = require('../common/chrome');
const Request = require('../common/request');

class SegmentfaultService {
    async _save_to_server(data) {
        Utils.safeRun(() => {
            Request.postWithAction("/front/crawler/crawler/save", {
                type: 'segmentfault',
                url: data.dataUrl,
                origin: 'segmentfault.com',
                data: JSON.stringify(data)
            });
        });
    }

    async _down_detail_page(data) {
        if (!data || !data.title) {
            return;
        } 
        let mainBodySelector = "div[id=__next] > div.bg-white.py-5";
        let { selector,pageTitle } = await Chrome.downSelector(data.url, mainBodySelector);
        if (Utils.isEmpty(selector)) {
            return;
        }
        data.title = (pageTitle || "").replaceAll("- SegmentFault 思否","");
        data.author = selector.find("div[class~=container] > div:nth-child(1) > div[class~=mx-auto] > div[class~=d-flex] > div[class~=d-flex] > a[class~=d-flex] > div[class~=d-flex]  > div[class~=d-flex] > strong[class=font-size-14]").text();
        data.content = selector.find("div[class~=container] > div:nth-child(2) > div[class~=mx-auto] > div").html();
        data.dataOrigin = "segmentfault";
        data.dataUrl = data.url;
        this._save_to_server(data);
    }

    async _down_list_data(list) {
        if (!list) {
            return;
        }
        for (let data of list) {
            try {
                await this._down_detail_page(data);
            } catch (e) {
                console.error(e);
            }
        }
    }

    async _down_list(url) {
        console.log("Download Url => " + url);
        let mainBodySelector = "div.blogs-content.mb-5.pt-4.container > div > div.col > div.content-list-wrap > div";
        let { $, selector } = await Chrome.downSelector(url, mainBodySelector);
        if (Utils.isEmpty(selector)) {
            return;
        }
        let list = [];
        var liNodes = selector.find("ul > li");
        if (liNodes) {
            liNodes.each((i, ele) => {
                let li = $(ele);
                let a = li.find("div > div[class=left] > h3 > a");
                if (a) {
                    list.push({
                        title: a.text(),
                        url: BASE_URL + a.attr("href")
                    });
                }
            });
        }
        await this._down_list_data(list);
    }

    async down() {
        for (var i = 1; i < 5; i++) {
            try {
                await Utils.sleep(UUID.random(10000, 50000));
                let url = BASE_URL + "/blogs/newest" + (i == 1 ? "" : ("?page=" + i));
                await this._down_list(url);
            } catch (e) {
                console.error(e);
            }
        }
    }
}

module.exports = SegmentfaultService