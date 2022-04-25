'use strict';

const BASE_URL = "https://segmentfault.com";
const Utils = require('oen-utils');
const UUID = require('oen-uuid');
const Chrome = require('../common/chrome');
const Request = require('../common/request');

class SegmentfaultService {
    async _save_to_server(data) {
        Utils.safeRun(() => {
            Request.postWithBase("segmentfault", data);
        });
    }

    async _down_detail_page(data) {
        if (!data) {
            return;
        }
        let mainBodySelector = "div[class~=article-content] > div[class=row] > div > div[class='mb-4 card'] > div[class~=card-body]";
        let { selector } = await Chrome.downSelector(data.url, mainBodySelector);
        if (Utils.isEmpty(selector)) {
            return;
        }
        data.author = selector.find("div[class~=align-items-center] > div[class~=d-flex] > a[class~=d-flex] > strong[class~=align-self-center]").text();
        data.content = selector.find("article[class~='article']").html();
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
        let mainBodySelector = "div[class=row] > div[class=col] > div[class=row] > div[class='middle-wrap col'] > div[class=content-list-wrap] > div[class='list-card-bg  card']";
        let { $, selector } = await Chrome.downSelector(url, mainBodySelector);
        if (Utils.isEmpty(selector)) {
            return;
        }
        let list = [];
        var liNodes = selector.find("ul > li");
        if (liNodes) {
            liNodes.each((i, ele) => {
                let li = $(ele);
                let a = li.find("div[class=content] > h5 > a");
                list.push({
                    title: a.text(),
                    url: BASE_URL + a.attr("href")
                })
            });
        }
        await this._down_list_data(list);
    }

    async down() {
        for (var i = 1; i < 10; i++) {
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