'use strict';

const Utils = require('oen-utils');
const AvdAliyunService = require('./service/AvdAliyunService');

(async () => {
    let avdAliyunService = new AvdAliyunService();
    Utils.safeRun(() => {
        avdAliyunService.downHighRisk();
    });

    Utils.safeRun(() => {
        avdAliyunService.downNvd();
    });
})();