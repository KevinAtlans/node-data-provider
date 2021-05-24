'use strict';

const Utils = require('oen-utils');
const BaiduService = require('./service/BaiduService');

(async () => {
    let baiduService = new BaiduService();
    Utils.safeRun(() => {
        baiduService.down();
    });
})();