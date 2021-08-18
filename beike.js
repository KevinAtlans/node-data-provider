'use strict';

const Utils = require('oen-utils');
const BeikeService = require('./service/BeikeService');

(async () => {
    let beikeService = new BeikeService();
    Utils.safeRun(() => {
        beikeService.down();
    });
})();