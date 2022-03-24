'use strict';

const BASE_URL = "https://cd.ke.com/ershoufang";
const Utils = require('oen-utils');
const UUID = require('oen-uuid');
const Chrome = require('../common/chrome');
const Request = require('../common/request');

class BeikeService {
    async _save_to_server(datas) {
        if (datas) {
            for (let data of datas) {
                Utils.safeRun(() => {
                    Request.postWithBase("beike-house", data);
                });
            }
        }
    }

    async _down_new_page(url) {
        console.log("Crawler Url: " + url);

        let mainBodySelector = "div[class=sellListPage] > div > div[class=leftContent] > div[data-component=list]";
        let { $, selector } = await Chrome.downSelector(url, mainBodySelector);
        if (Utils.isEmpty($) || Utils.isEmpty(selector)) {
            return null;
        }


        var nodes = selector.find("ul[class='sellListContent'] > li[class=clear] > div[class='info clear']");
        if (nodes) {
            let list = [];
            nodes.each((i, ele) => {
                let node = $(ele);
                let href = Utils.trimToOne(node.find("div[class='title'] > a").attr("href"));
                let title = Utils.trimToOne(node.find("div[class='title'] > a").text());
                let address = Utils.trimToOne(node.find("div[class='address'] > div[class='flood'] > div[class='positionInfo'] > a").text());
                let houseInfo = Utils.trimToOne(node.find("div[class='address'] > div[class='houseInfo']").text());
                let totalPrice = Utils.trimToOne(node.find("div[class='address'] > div[class='priceInfo'] > div[class='totalPrice']").text());
                if (!Utils.isEmpty(totalPrice)) {
                    totalPrice = Utils.parseFloat(totalPrice);
                }
                let price = Utils.trimToOne(node.find("div[class='address'] > div[class='priceInfo'] > div[class='unitPrice']").attr("data-price"));
                if (!Utils.isEmpty(price)) {
                    try {
                        price = Utils.parseInt(price);
                    } catch (e) { }
                }
                var priceStr = Utils.trimToOne(node.find("div[class='address'] > div[class='priceInfo'] > div[class='unitPrice'] > span").text());
                if (!Utils.isEmpty(priceStr)) {
                    priceStr = priceStr.replace("单价", "");
                    priceStr = priceStr.replace("参考价:", "");
                }

                list.push({
                    dataOrigin: "BEIKE",
                    dataUrl: href,
                    title: title,
                    houseAddress: address,
                    info: houseInfo,
                    total: totalPrice,
                    price: price,
                    priceStr: priceStr,
                });
            });

            this._save_to_server(list);
        }
    }

    async down() {
        for (var i = 1; i < 20; i++) {
            try {
                await Utils.sleep(UUID.random(10000, 50000));
                let url = BASE_URL + "/pg" + i + "co32/"
                await this._down_new_page(url);
            } catch (e) {
                console.error(e);
            }
        }
    }
}

module.exports = BeikeService