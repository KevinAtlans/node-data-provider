'use strict';

const Utils = require('oen-utils');
const AvdAliyunService = require('./service/AvdAliyunService');

/**
 * 漏洞库列表
 * 
 * http://www.nsfocus.net/index.php?act=sec_bug
 * https://anquan.baidu.com/bug_search?vul_num=
 * http://www.cnnvd.org.cn/web/vulnerability/querylist.tag
 * https://vul.wangan.com/
 * https://www.cnvd.org.cn/flaw/list
 * https://www.cve.org/Downloads
 */
(async () => {
    let avdAliyunService = new AvdAliyunService();
    Utils.safeRun(() => {
        avdAliyunService.downHighRisk();
    });

    Utils.safeRun(() => {
        avdAliyunService.downNvd();
    });
})();