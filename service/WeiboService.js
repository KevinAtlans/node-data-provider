'use strict';

const cheerio = require('cheerio');
const Utils = require('oen-utils');
const Chrome = require('../common/chrome');
const Request = require('../common/request');

class WeiboService {
    async _down_weibo_realtimehot() {
        let url = "https://s.weibo.com/top/summary?cate=realtimehot";
        let mainBodySelector = "div[class=m-main] > div[class='woo-box-flex']  > div[class=m-wrap] > div[class=data] > table";

        let page = await Chrome.down(url, mainBodySelector);
        if (Utils.isEmpty(page)) {
            return null;
        }

        const $ = cheerio.load(page.html);
        let mainBody = $(mainBodySelector);
        if (Utils.isEmpty(mainBody)) {
            return null;
        }

        var trNodes = mainBody.find("tbody > tr");
        let list = [];
        if (trNodes) {
            trNodes.each((i, ele) => {
                let tr = $(ele);

                let idx = parseInt(Utils.trimToOne(tr.find('td[class="td-01 ranktop"]').text()));
                let a = tr.find('td[class=td-02] > a');
                let title = Utils.trimToOne(a.text());
                let href = Utils.trimToOne(a.attr("href"));
                let hot = Utils.trimToOne(tr.find('td[class=td-02] > span').text());

                if (!Utils.isEmpty(title) && !Utils.isEmpty(hot)) {
                    list.push({
                        source: "weibo",
                        rank: idx,
                        title: title,
                        url: "https://s.weibo.com" + href,
                        hotValue: hot
                    });
                }
            });
        }
        return list;

    }

    async _down_data_detail(data) {
        if (Utils.isEmpty(data)) {
            return null;
        }

        let url = data.url;
        let mainBodySelector = "div[class=m-main] > div[id=pl_feed_main] > div[class=m-wrap] > div[class=m-con-l] > div > div[class=card-wrap] > div > p";
        let page = await Chrome.down(url, mainBodySelector);
        if (Utils.isEmpty(page)) {
            return data;
        }

        const $ = cheerio.load(page.html);
        let mainBody = $(mainBodySelector);
        if (Utils.isEmpty(mainBody)) {
            return data;
        }

        let content = Utils.trimToOne(mainBody.text());
        if (content.startsWith("导语：")) {
            content = content.substring(3);
        }

        data.content = content;
        return data;
    }

    async down() {
        let list = await this._down_weibo_realtimehot();
        if (Utils.isEmpty(list)) {
            return;
        }
        for (let data of list) {
            let newData = await this._down_data_detail(data);
            if (!Utils.isEmpty(newData)) {
                Utils.safeRun(() => {
                    console.log(newData);
                    Request.postWithBase("/api/hot-news/add", newData);
                });
            }
        }
    }
}


module.exports = WeiboService