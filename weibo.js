'use strict';

const Utils = require('oen-utils');
const WeiboService = require('./service/WeiboService');

(async () => {
    let weiboService = new WeiboService();
    Utils.safeRun(() => {
        weiboService.down();
    });
})();