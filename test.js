'use strict';

const Utils = require('oen-utils');
const Chrome = require('./common/chrome');

const AweiVPNService = require('./service/AweiVPNService');

(async () => {

    Utils.safeRun(() => {
        console.log(__dirname);
    });
    Chrome.down("https://lf9-apk.ugapk.cn/package/apk/aweme/1015_240001/aweme_aweGW_v1015_240001_b721_1673449179.apk?v=1673449203");

    let aweiVPNService = new AweiVPNService();
    Utils.safeRun(() => {
        aweiVPNService.load_file();
    });

    // Utils.safeRun(() => {
    //     console.log(process.execPath);
    // });
    // Utils.safeRun(() => {
    //     console.log(process.cwd());
    // });
    // Utils.safeRun(() => {
    //     console.log(process.env);
    // }); 
    // Utils.safeRun(() => {
    //     console.log(process.env);
    // });
})();