'use strict';

const Utils = require('oen-utils');
const Chrome = require('../common/chrome');
const Request = require('../common/request');
class BaiduService {
    async _down_top_baidu() {
        let url = "https://top.baidu.com/board?tab=realtime";
        let mainBodySelector = "div[id=sanRoot] > main > div[class^='container right-container'] > div[class^=container-bg]";

        let { $, selector } = await Chrome.downSelector(url, mainBodySelector);
        if (Utils.isEmpty(selector)) {
            return null;
        }

        var trNodes = selector.find("div > div[class^=category-wrap]");
        let list = [];
        if (trNodes) {
            trNodes.each((i, ele) => {
                let tr = $(ele);
                console.log(tr.text())
                let a = tr.find("a[class^=img-wrapper]");
                let idx = parseInt(Utils.trimToOne(a.find('div[class^=index]').text()));
                let title = Utils.trimToOne(tr.find('div[class^=content] > a[class^=title] > div[class=c-single-text-ellipsis]').text());
                let content = Utils.trimToOne(tr.find('div[class^=content] > div[class^=hot-desc]').text());
                if (Utils.isEmpty(content)) {
                    content = contesnt.replace("查看更多>", "");
                }
                let href = Utils.trimToOne(a.attr("href"));
                let hot = parseInt(Utils.trimToOne(tr.find('div[class^=trend] > div[class^=hot-index]').text()));
                if (!Utils.isEmpty(title)) {
                    list.push({
                        source: "baidu",
                        rank: idx,
                        title: title,
                        href: href,
                        content: content,
                        hotValue: hot
                    });
                }
            });
        }
        return list;
    }

    async _down_baidu_page_detail(url) {
        if (Utils.isEmpty(url)) {
            return null;
        }
        try {

            let mainBodySelector = "html > body";
            let { $, pageUrl, selector } = await Chrome.downSelector(url, mainBodySelector);
            if (Utils.isEmpty($) || Utils.isEmpty(pageUrl) || Utils.isEmpty(selector)) {
                return null;
            }

            if (pageUrl.startsWith("https://baijiahao.baidu.com/")) {
                let title = Utils.trimToOne(selector.find("div[class^=app-module_headerWrapper] > div[class^=index-module_headerWrap] > h2[class^=index-module_articleTitle]").text());
                let author = Utils.trimToOne(selector.find("div[class^=app-module_headerWrapper] > div[class^=index-module_headerWrap] > div[class^=index-module_articleDesc] > div[class^=index-module_authorTxt] > a > p").text());
                let pList = selector.find("div[class^=app-module_articleWrapper] > div[class^=app-module_leftSection] > div[class^=index-module_articleWrap] > div[class^=index-module_textWrap] > p");
                let content = "";
                if (pList) {
                    pList.each((i, ele) => {
                        let p = $(ele);
                        let pt = Utils.trimToOne(p.text());
                        if (!Utils.isEmpty(pt)) {
                            content += (pt + "\n");
                        }
                    });
                }
                return {
                    url: pageUrl,
                    title: title,
                    author: author,
                    content: content
                };
            } else if (pageUrl.startsWith("https://www.163.com/dy/article")) {
                let title = Utils.trimToOne(selector.find("div[class='wrapper clearfix'] > div[class=post_main] > h1[class=post_title]").text());
                let author = Utils.trimToOne(selector.find("div[class='wrapper clearfix'] > div[class=post_main] > div[class=post_info]").text());
                if (!Utils.isEmpty(author)) {
                    if (author.includes("来源:")) {
                        author = Utils.trimToOne(author.substring(author.indexOf("来源:") + 3));
                    }
                }

                let pList = selector.find("div[class='wrapper clearfix'] > div[class=post_main] > div[class=post_content] > div[class=post_body] > p");
                let content = "";
                if (pList) {
                    pList.each((i, ele) => {
                        let p = $(ele);
                        let pt = Utils.trimToOne(p.text());
                        if (!Utils.isEmpty(pt)) {
                            content += (pt + "\n");
                        }
                    });
                }

                return {
                    url: pageUrl,
                    title: title,
                    author: author,
                    content: content
                };
            } else if (pageUrl.startsWith("https://new.qq.com/omn")) {
                let title = Utils.trimToOne(selector.find("div[class='qq_conent clearfix'] > div[class=LEFT] > h1").text());
                let author = Utils.trimToOne(selector.find("div[class='qq_conent clearfix'] > div[class=LEFT] > div[class='content clearfix'] > div[id=LeftTool] > div[left-stick-wp] > div[data-bossirs=ly] > a[class=author] > div").text());
                let pList = selector.find("div[class='qq_conent clearfix'] > div[class=LEFT] > div[class='content clearfix'] > div[class=content-article] > p");
                let content = "";
                if (pList) {
                    pList.each((i, ele) => {
                        let p = $(ele);
                        let pt = Utils.trimToOne(p.text());
                        if (!Utils.isEmpty(pt)) {
                            content += (pt + "\n");
                        }
                    });
                }
                return {
                    url: pageUrl,
                    title: title,
                    author: author,
                    content: content
                };
            } else if (pageUrl.startsWith("https://www.thepaper.cn/newsDetail")) {
                let title = Utils.trimToOne(selector.find("div[class='bdwd main clearfix newDetail_sparker'] > div[class=main_lt] > div[class=newscontent] > h1[class=news_title]").text());
                let author = Utils.trimToOne(selector.find("div[class='bdwd main clearfix newDetail_sparker'] > div[class=main_lt] > div[class=newscontent] > div[class='news_paike_author clearfix'] > a > div[class=name]").text());
                let content = Utils.trimToOne(selector.find("div[class='bdwd main clearfix newDetail_sparker'] > div[class=main_lt] > div[class=newscontent] > div[class=news_txt]").text());
                return {
                    url: pageUrl,
                    title: title,
                    author: author,
                    content: content
                };
            }
        } catch (e) {
            console.error(e);
        }
        return null;
    }

    async _down_data_detail(data) {
        if (Utils.isEmpty(data)) {
            return null;
        }
        let url = data.href;
        if (Utils.isEmpty(url)) {
            let title = data.title;
            url = "https://www.baidu.com/s?wd=" + encodeURIComponent(title);
        }

        let mainBodySelector = "div[id=container] > div[id=content_left]";
        let { $, selector } = await Chrome.downSelector(url, mainBodySelector);
        if (Utils.isEmpty($) || Utils.isEmpty(selector)) {
            return null;
        }
        let hrefs = [];

        var listNodes = selector.find("div[class='c-group-wrapper'] > div[class='result-op c-container xpath-log new-pmd'] > div > div[class^=img-content-container] > div[class=c-row] > div[class=c-span-last] > span[class^=title] > a");
        listNodes.each((i, ele) => {
            let node = $(ele);
            let href = node.attr("href");
            if (!Utils.isEmpty(href)) {
                hrefs.push(href);
            }
        });

        listNodes = selector.find("div[class='c-group-wrapper'] > div[class='result-op c-container new-pmd xpath-log'] > div[class=new-pmd] > div[class^=c-row] > div[class='op_sp_realtime_group_title_new op-realtime-new-union c-span9 c-span-last'] > a[class='op_sp_realtime_new_group_title_text']");
        listNodes.each((i, ele) => {
            let node = $(ele);
            let href = node.attr("href");
            if (!Utils.isEmpty(href)) {
                hrefs.push(href);
            }
        });

        listNodes = selector.find("div[class='result c-container new-pmd'] > h3[class=t] > a");
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
            try {
                let newData = await this._down_data_detail(data);
                if (!Utils.isEmpty(newData)) {
                    Utils.safeRun(() => {
                        console.log(newData);
                        Request.postWithBase("/api/hot-news/add", newData);
                    });
                }
            } catch (e) {
                console.error(e);
            }
        }
    }
}

module.exports = BaiduService