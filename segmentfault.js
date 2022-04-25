'use strict';

const Utils = require('oen-utils');
const SegmentfaultService = require('./service/SegmentfaultService');

(async () => {
    let segmentfaultService = new SegmentfaultService();
    Utils.safeRun(() => {
        segmentfaultService.down();
    });
})();