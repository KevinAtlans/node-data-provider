'use strict';

const Utils = require('oen-utils');
const AweiVPNService = require('./service/AweiVPNService');

(async () => {
    let aweiVPNService = new AweiVPNService();
    Utils.safeRun(() => {
        aweiVPNService.down();
        console.log("END");
    });
})();