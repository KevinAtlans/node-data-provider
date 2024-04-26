'use strict';

const Utils = require('oen-utils');
const fetch = require('node-fetch');
const Chrome = require('../common/chrome');
const Request = require('../common/request');

class BilibiliService {
    _to_number(data) {
        if (Utils.isEmpty(data)) {
            return 0;
        }
        if (data.endsWith("万")) {
            return parseFloat(data.replace("万", "")) * 10000;
        }

        if (data.endsWith("千")) {
            return parseFloat(data.replace("千", "")) * 1000;
        }

        if (data.endsWith("K")) {
            return parseFloat(data.replace("K", "")) * 1000;
        }

        return data;
    }

    async _down_popular_all() {
        let list = [];
        let url = "https://www.bilibili.com/v/popular/all";
        let mainBodySelector = "div[id=app] > div[class='popular-container'] > div[class='popular-video-container popular-list'] > div[class=flow-loader]";

        let { $, selector } = await Chrome.downSelector(url, mainBodySelector);
        if (Utils.isEmpty(selector)) {
            return list;
        }

        var nodes = selector.find("ul[class='card-list'] > div[class='video-card']");
        if (nodes) {
            nodes.each((i, ele) => {
                let node = $(ele);

                let video_url = Utils.trimToOne(node.find("div[class='video-card__content'] > a[target='_blank']").attr("href"));
                let video_tag = Utils.trimToOne(node.find("div[class='video-card__info'] > div > span[class='rcmd-tag strong-tag']").text());

                if (!Utils.isEmpty(video_url)) {
                    let video_bid = video_url.substring(video_url.lastIndexOf("/") + 1);
                    list.push({
                        dataOrigin: "bilibili",
                        bvid: video_bid,
                        dataUrl: video_url,
                        tag: video_tag,
                    });
                }
            });
        }
        console.log(list);
        return list;

    }

    async _down_rank_all() {
        let self = this;
        let list = [];
        let url = "https://www.bilibili.com/v/popular/rank/all";
        let mainBodySelector = "div[id=app] > div[class=popular-container] > div[class='rank-container'] > div[class=rank-list-wrap]";

        let { $, selector } = await Chrome.downSelector(url, mainBodySelector);
        if (Utils.isEmpty(selector)) {
            return list;
        }

        var nodes = selector.find("ul[class='rank-list'] > li[class='rank-item']");
        if (nodes) {
            nodes.each((i, ele) => {
                let node = $(ele);

                let video_rank_idx = Utils.parseInt(Utils.trimToOne(node.find("div[class='num']").text()));
                let video_url = Utils.trimToOne(node.find("div[class='content'] > div[class=img] > a[target='_blank']").attr("href"));
                let video_hot_value = Utils.parseInt(Utils.trimToOne(node.find("div[class='content'] > div[class=info] > div[class=pts] > div").text()));

                if (!Utils.isEmpty(video_url)) {
                    let video_bid = video_url.substring(video_url.lastIndexOf("/") + 1);
                    list.push({
                        dataOrigin: "bilibili",
                        rankIdx: video_rank_idx,
                        bvid: video_bid,
                        dataUrl: video_url,
                        hotValue: video_hot_value
                    });
                }
            });
        }
        return list;
    }

    async _down_video_detail(data) {
        if (Utils.isEmpty(data)) {
            return data;
        }
        let url = "http://api.bilibili.com/x/web-interface/view?bvid=" + data.bvid;
        let json = await fetch(url).then(res => res.json()).then(json => json).catch(reason => { console.error(reason); return null; });
        if (Utils.isEmpty(json) || json.code != 0) {
            return data;
        }
        let jData = json.data;
        if (Utils.isEmpty(jData)) {
            return data;
        }
        data.aid = jData.aid;
        data.cid = jData.cid;
        data.tid = jData.tid;
        data.title = jData.title;
        data.videoDesc = jData.desc;
        data.tname = jData.tname;
        data.cover = jData.pic;
        data.pubdate = jData.pubdate;
        data.ctime = jData.ctime;
        data.duration = jData.duration;
        data.dynamicContent = jData.dynamic;

        if (!Utils.isEmpty(jData.owner)) {
            data.authorMid = jData.owner.mid;
            data.authorName = jData.owner.name;
            data.authorFace = jData.owner.face;
        }

        if (!Utils.isEmpty(jData.stat)) {
            data.statView = jData.stat.view;
            data.statDanmaku = jData.stat.danmaku;
            data.statReply = jData.stat.reply;
            data.statFavorite = jData.stat.favorite;
            data.statCoin = jData.stat.coin;
            data.statShare = jData.stat.share;
            data.statViewNowRank = jData.stat.now_rank;
            data.statHisRank = jData.stat.his_rank;
            data.statLike = jData.stat.like;
            data.statDislike = jData.stat.dislike;
        }

        if (!Utils.isEmpty(jData.dimension)) {
            data.dimensionWidth = jData.dimension.width;
            data.dimensionHeight = jData.dimension.height;
            data.dimensionRotate = jData.dimension.rotate;
        }
        return data;
    }

    async down() {
        let popular = await this._down_popular_all();
        let rank = await this._down_rank_all();
        let list = popular.concat(rank);

        if (Utils.isEmpty(list)) {
            return;
        }

        for (let data of list) {
            let newData = await this._down_video_detail(data);
            if (!Utils.isEmpty(newData)) {
                Utils.safeRun(() => {
                    Request.postWithAction("/front/crawler/crawler/save", {
                        type: 'VideoBilibili',
                        url: newData.dataUrl,
                        origin: 'www.bilibili.com',
                        data: JSON.stringify(newData)
                    });
                });
            }
        }
    }
}


module.exports = BilibiliService