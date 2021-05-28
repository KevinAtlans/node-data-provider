'use strict';

var Chrome = require("./common/chrome");

(async () => {
    let url = "https://www.baidu.com/link?url=GTGpnrcqMQzCo2FcnK7ywLtBCxUeLqTwh5YZyig3gaEIHuZ3u59aN91rypq_1RlyVgK3ibCu3sA54pIbiL7gBLjOiQ0Vm2HgDREiUQ174BK&wd=&eqid=ef77dee600001c880000000660b09482";
    url = "https://www.baidu.com/link?url=LX0ohhp5dFqeVTgkDJmDdjWV1LbNtZwt0wr9j7NlyD02rLKcfwPen2HzeGlop21EagGVaQPte_TXUE1OmB0SNfdB9ly27eFgh3BVt_m7Mqi&wd=&eqid=d01c4f0a00004b560000000660b0a65c";
    let u = await Chrome.fetchBaiduRedirect(url);
    console.log(u);
})();