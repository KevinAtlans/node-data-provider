'use strict';

const Utils = require('oen-utils');
const BilibiliService = require('./service/BilibiliService');

(async () => {
    let bilibiliService = new BilibiliService();
    Utils.safeRun(() => {
        bilibiliService.down();
    });
})();