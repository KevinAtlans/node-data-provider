'use strict';

(async () => {
    Utils.safeRun(() => {
        console.log(process.execPath);
    });
    Utils.safeRun(() => {
        console.log(__dirname);
    });
    Utils.safeRun(() => {
        console.log(process.cwd());
    });
    Utils.safeRun(() => {
        console.log(process.env);
    });
})();