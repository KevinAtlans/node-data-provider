'use strict';
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const Utils = require('oen-utils');
const UUID = require('oen-uuid');

const WINDOW_WIDTH = 1920;
const WINDOW_HEIGHT = 4320;

/**
 * https://zhaoqize.github.io/puppeteer-api-zh_CN/#?product=Puppeteer&version=v9.1.1&show=api-class-puppeteer
 * 
 * 
 * ps aux | grep chrome-linux | grep -v grep | awk '{print $2}' | xargs kill -9
 * 
 * clickEventList=[{
 *      sleep: 2000,
 *      selector: '',
 *      type: 'click',
 * },{
 *      sleep: 3000,
 *      selector: '',
 *      type: 'input',
 *      text: 'content'
 * }]
 */
class Chrome {
    static async downSelector(url, waitForSelector, eventList, iframe) {
        let page = await Chrome.down(url, waitForSelector, eventList, iframe);
        if (Utils.isEmpty(page)) {
            console.log("== Chrome Down Selector Fail =====================================================");
            console.log(url);
            console.log(downSelector);
            console.log("== Chrome Down Selector Fail =====================================================");
            return {
                $: null,
                pageUrl: null,
                pageTitle: null,
                frame: null,
                selector: null
            };
        }

        const $ = cheerio.load(page.html);
        let selector = $(waitForSelector);
        if (Utils.isEmpty(selector)) {
            return null;
        }
        let frame = null;
        if (page.frame) {
            frame = cheerio.load(page.frame);
        }
        cheerio.load(page.html);
        return {
            $: $,
            pageUrl: page.url,
            pageTitle: page.title,
            frame: frame,
            selector: selector
        };
    }

    static async down(url, waitForSelector, eventList, iframe) {
        if (Utils.isEmpty(url)) {
            return null;
        }

        await Utils.sleep(UUID.random(2000, 5000));

        let browser = null, context = null, page = null;

        try {
            browser = await puppeteer.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--no-first-run',
                    '--mute-audio',
                    '--disable-web-security',
                    '--disable-setuid-sandbox',
                    '--disable-notifications',
                    // '--disable-features=IsolateOrigins,site-per-process',
                    `--window-size=${WINDOW_WIDTH},${WINDOW_HEIGHT}`,
                ],
                ignoreHTTPSErrors: true,
                defaultViewport: {
                    width: WINDOW_WIDTH,
                    height: WINDOW_HEIGHT,
                },
                timeout: 10000,
                slowMo: 100
            });

            context = await browser.createIncognitoBrowserContext();
            page = await context.newPage();

            await page._client.send('Page.setDownloadBehavior', {
                behavior: 'allow',
                downloadPath: __dirname
            });

            await page.setJavaScriptEnabled(true);
            await page.setRequestInterception(true);

            page.on('request', (interceptedRequest) => {
                let url = interceptedRequest.url();
                if (url.endsWith('.png') || url.endsWith('.jpg') || url.endsWith('.gif')) {
                    interceptedRequest.abort()
                } else {
                    interceptedRequest.continue()
                }
            });

            page.on('error', (e, any) => {
                console.log('Browser Error:')
                console.log(e)
                console.log(any)
            });
            try {
                await page.goto(url);
            } catch (e) {
                console.log(e);
            }
            if (!Utils.isEmpty(waitForSelector)) {
                try {
                    await page.waitForSelector(waitForSelector);
                } catch (e) {
                    console.error("Page WaitForSelector Error");
                    console.error(url, e);

                    await page.close();
                    await context.close();
                    await browser.close();

                    return null;
                }
            }

            await Utils.sleep(3000);

            let frame = null;
            if (iframe) {
                let frameHandle = await page.$(iframe);
                let contentFrame = await frameHandle.contentFrame();
                frame = await contentFrame.content();
            }

            if (eventList && eventList.length > 0) {
                for (let event of eventList) {
                    if (event.selector) {
                        let node = await page.$(event.selector);
                        if (node) {
                            if ('click' == event.type) {
                                await node.click()
                            } else if ('input' == event.type) {
                                await node.type(event.text)
                            }
                        }
                        if (event.sleep) {
                            await Utils.sleep(event.sleep);
                        }
                    }
                }
            }

            let pageUrl = await page.url();
            let pageTitle = await page.title();
            let pageHtml = await page.content();

            await page.close();
            await context.close();
            await browser.close();

            return {
                url: pageUrl,
                title: pageTitle,
                html: pageHtml,
                frame: frame,
            };
        } catch (e) {
            console.error(url, e);

            if (page != null) {
                await page.close();
                console.log("Close Page: ", url);
            }
            if (context != null) {
                await context.close();
                console.log("Close Context: ", url);
            }
            if (browser != null) {
                await browser.close();
                console.log("Close Browser: ", url);
            }
        }
        return null;
    }

    static async fetchBaiduRedirect(url) {
        return await fetch(url).then(data => data.text()).then(html => {
            console.log("html: ", html);
            let start = html.indexOf('content="0;URL=') + 16;
            let end = html.indexOf('"></noscript>') - 1;
            let content = html.substring(start, end);
            return content;
        }).catch(reason => {
            return url;
        });

    }
}


module.exports = Chrome