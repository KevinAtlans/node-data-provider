'use strict';

const Utils = require('oen-utils');
const Chrome = require('../common/chrome');
const Request = require('../common/request');

class AvdAliyunService {

    getString(node, selector) {
        if (!node || !selector) {
            return "";
        }
        let tmp = node.find(selector);
        if (!tmp) {
            return "";
        }
        return Utils.trimAll(tmp.text());
    }

    getHtml(node, selector) {
        if (!node || !selector) {
            return "";
        }
        let tmp = node.find(selector);
        if (!tmp) {
            return "";
        }
        console.log(tmp.html());

        return Utils.trim(tmp.html());
    }

    async _save_data_to_server(data) {
        if (!data) {
            return;
        }
        Utils.safeRun(() => {
            Request.postWithBase("avd.aliyun.com", data);
        });
    }

    async _down_detail(data) {
        let mainBodySelector = "body";
        let { $, selector } = await Chrome.downSelector(data.dataUrl, mainBodySelector);
        if (Utils.isEmpty(selector)) {
            return;
        }
        let title = selector.find("body > div.px-lg-5.px-3.py-lg-3.pt-4.bg-white > div.row.pt-3 > div.col-sm-8 > div:nth-child(1) > h5");
        data.title = this.getString(title, "span[class=header__title__text]");
        data.lv = this.getString(title, "span[class='badge badge-danger']");

        let info = selector.find("div.px-lg-5.px-3.py-lg-3.pt-4.bg-white > div.row.pt-3 > div.col-sm-8 > div.d-flex.flex-lg-nowrap.flex-wrap.justify-content-start.pt-2.col-lg-9.col-sm-12.px-0")
        data.cveId = this.getString(info, "div:nth-child(1) > div[class=metric] > div[class=metric-value]");
        data.expMaturity = this.getString(info, "div:nth-child(2) > div[class=metric] > div[class=metric-value]");
        data.patchStatus = this.getString(info, "div:nth-child(3) > div[class=metric] > div[class=metric-value]");
        data.publicTime = this.getString(info, "div:nth-child(4) > div[class=metric] > div[class=metric-value]");

        let intro = selector.find("div.px-lg-5.px-2.bg-light > div > div.col-sm-8");
        data.intro = this.getString(intro, "div.py-4.pl-4.pr-4.px-2.bg-white.rounded.shadow-sm > div:nth-child(2) > div");
        data.suggest = this.getString(intro, "div.py-4.pl-4.pr-4.px-2.bg-white.rounded.shadow-sm > div:nth-child(4)");
        data.reference = this.getHtml(intro, "div.py-4.pl-4.pr-4.px-2.bg-white.rounded.shadow-sm > div.text-detail.pb-3.pt-2.reference > table > tbody > tr > td > a");

        let more = selector.find("div.px-lg-5.px-2.bg-light > div > div.col-sm-4 > div > div:nth-child(1) > div > div > ul");
        data.attackPath = this.getString(more, "li:nth-child(1) > div.cvss-breakdown__desc");
        data.attackComplexity = this.getString(more, "li:nth-child(2) > div.cvss-breakdown__desc");
        data.permissionRequirements = this.getString(more, "li:nth-child(3) > div.cvss-breakdown__desc");
        data.scopeOfInfluence = this.getString(more, "li:nth-child(4) > div.cvss-breakdown__desc");
        data.dataConfidentiality = this.getString(more, "li:nth-child(7) > div.cvss-breakdown__desc");
        data.dataIntegrity = this.getString(more, "li:nth-child(8) > div.cvss-breakdown__desc");
        data.serverHarm = this.getString(more, "li:nth-child(9) > div.cvss-breakdown__desc");

        await this._save_data_to_server(data);
    }

    async _down_list_data(list) {
        if (!list) {
            return;
        }

        for (let data of list) {
            try {
                await Utils.sleep(UUID.random(10000, 50000));
                await this._down_detail(data);
            } catch (e) {
                console.error(e);
            }
        }
    }

    async _down_list(url) {
        let mainBodySelector = "main[role=main] > div[class='py-3 bg-light'] > div[class~=container] > div[class~=table-responsive]";
        let { $, selector } = await Chrome.downSelector(url, mainBodySelector);
        if (Utils.isEmpty(selector)) {
            return;
        }
        let list = [];
        var trs = selector.find("table[class=table] > tbody > tr");
        if (trs) {
            trs.each((i, ele) => {
                let tr = $(ele);
                let a = tr.find("td[nowrap=nowrap] > a[target=_blank]");
                list.push({
                    dataOrigin: 'avd.aliyun.com',
                    dataUrl: 'https://avd.aliyun.com' + a.attr("href"),
                    avdId: Utils.trimAll(a.text()),
                });
            });
        }
        await this._down_list_data(list);
    }

    async down(baseUrl) {
        for (let i = 1; i < 10; i++) {
            await Utils.sleep(UUID.random(10000, 50000));
            let url = baseUrl + (i == 1 ? "" : ("?page=" + i));
            await this._down_list(url);
        }
    }

    async downHighRisk() {
        await this.down("https://avd.aliyun.com/high-risk/list");
    }

    async downNvd() {
        await this.down(" https://avd.aliyun.com/nvd/list");
    }
}

module.exports = AvdAliyunService