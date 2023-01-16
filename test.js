'use strict';

const Utils = require('oen-utils');
const Chrome = require('./common/chrome');

const AweiVPNService = require('./service/AweiVPNService');

(async () => {

    Utils.safeRun(() => {
        console.log(__dirname);
    });
    Chrome.down("https://telegram.org/dl/android/apk");


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