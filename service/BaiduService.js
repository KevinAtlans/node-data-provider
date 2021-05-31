'use strict';

const cheerio = require('cheerio');
const Utils = require('oen-utils');
const Chrome = require('../common/chrome');
const Request = require('../common/request');

class BaiduService {
    async _down_top_baidu() {
        let url = "http://top.baidu.com/buzz?b=1&fr=topindex";
        let mainBodySelector = "div[id=main] > div[class=mainBody] > div[class=grayborder] > table[class=list-table]";

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
                let idx = parseInt(Utils.trimToOne(tr.find('td[class=first] > span').text()));
                let title = Utils.trimToOne(tr.find('td[class=keyword] > a[class=list-title]').text());
                let hot = parseInt(Utils.trimToOne(tr.find('td[class=last]').text()));
                if (!Utils.isEmpty(title)) {
                    list.push({
                        source: "baidu",
                        rank: idx,
                        title: title,
                        hotValue: hot
                    });
                }
            });
        }
        return list;
    }

    async _down_baidu_baijiahao_detail(url) {
        if (Utils.isEmpty(url)) {
            return null;
        }

        let mainBodySelector = "div[id=app] > div[id=ssr-content-wrapper] > div[id=ssr-content]";
        let page = await Chrome.down(url, mainBodySelector);
        if (Utils.isEmpty(page)) {
            return null;
        }

        let pageUrl = page.url;
        if (pageUrl.startsWith("https://baijiahao.baidu.com/")) {
            const $ = cheerio.load(page.html);
            let mainBody = $(mainBodySelector);
            if (Utils.isEmpty(mainBody)) {
                return null;
            }

            let title = Utils.trimToOne(mainBody.find("div[class^=app-module_headerWrapper] > div[class^=index-module_headerWrap] > h2[class^=index-module_articleTitle]").text());
            let author = Utils.trimToOne(mainBody.find("div[class^=app-module_headerWrapper] > div[class^=index-module_headerWrap] > div[class^=index-module_articleDesc] > div[class^=index-module_authorTxt] > a > p").text());
            let pList = mainBody.find("div[class^=app-module_articleWrapper] > div[class^=app-module_leftSection] > div[class^=index-module_articleWrap] > div[class^=index-module_textWrap] > p");
            let content = "";
            if (pList) {
                pList.each((i, ele) => {
                    let p = $(ele);
                    content += (Utils.trimToOne(p.text()) + "\n");
                });
            }
            return {
                url: pageUrl,
                title: title,
                author: author,
                content: content
            };
        }
        return null;
    }

    async _down_baidu_page_detail(url) {
        if (Utils.isEmpty(url)) {
            return null;
        }

        let newUrl = await Chrome.fetchBaiduRedirect(url);
        if (Utils.isEmpty(newUrl)) {
            return null;
        }

        if (newUrl.includes('baidu.com')) {
            return this._down_baidu_baijiahao_detail(newUrl);
        }

        return null;
    }

    async _down_data_detail(data) {
        if (Utils.isEmpty(data)) {
            return null;
        }

        let title = data.title;
        let url = "https://www.baidu.com/s?wd=" + encodeURIComponent(title);
        let mainBodySelector = "div[id=container] > div[id=content_left]";
        let page = await Chrome.down(url, mainBodySelector);
        if (Utils.isEmpty(page)) {
            return data;
        }

        const $ = cheerio.load(page.html);
        let mainBody = $(mainBodySelector);
        if (Utils.isEmpty(mainBody)) {
            return data;
        }

        var listNodes = mainBody.find("div[class='result c-container new-pmd'] > h3[class=t] > a");
        let hrefs = [];
        listNodes.each((i, ele) => {
            let node = $(ele);
            let href = node.attr("href");
            if (!Utils.isEmpty(href)) {
                hrefs.push(href);
            }
        });

        for (let href of hrefs) {
            let dataDetail = await this._down_baidu_page_detail(href);
            if (!Utils.isEmpty(dataDetail)) {
                data.subTitle = dataDetail.title;
                data.author = dataDetail.author;
                data.content = dataDetail.content;
                data.url = dataDetail.url;
                return data;
            }
        }

        return data;
    }

    async down() {
        let list = await this._down_top_baidu();
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


module.exports = BaiduService