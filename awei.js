'use strict';

const Utils = require('oen-utils');
const AweiVPNService = require('./service/AweiVPNService');

(async () => {
    let aweiVPNService = new AweiVPNService();
    Utils.safeRun(() => {
        // aweiVPNService.load_file();
        aweiVPNService.down();
    });
})();