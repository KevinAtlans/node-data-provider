'use strict';
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const Utils = require('oen-utils');
const UUID = require('oen-uuid');

/**
 * https://zhaoqize.github.io/puppeteer-api-zh_CN/#?product=Puppeteer&version=v9.1.1&show=api-class-puppeteer
 * 
 * 
 * ps aux | grep chrome-linux | grep -v grep | awk '{print $2}' | xargs kill -9
 */
class Chrome {
    static async downSelector(url, waitForSelector) {
        let page = await Chrome.down(url, waitForSelector);
        if (Utils.isEmpty(page)) {
            return null;
        }

        const $ = cheerio.load(page.html);
        let selector = $(waitForSelector);
        if (Utils.isEmpty(selector)) {
            return null;
        }
        return {
            $: $,
            pageUrl: page.url,
            pageTitle: page.title,
            selector: selector
        };
    }

    static async down(url, waitForSelector) {
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
                    '--mute-audio',
                    '--disable-setuid-sandbox',
                    '--no-first-run',
                    '--disable-notifications',
                ],
                ignoreHTTPSErrors: true,
                defaultViewport: {
                    width: 1440,
                    height: 15000,
                },
                timeout: 10000,
            });

            context = await browser.createIncognitoBrowserContext();
            page = await context.newPage();

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

            await page.goto(url);

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