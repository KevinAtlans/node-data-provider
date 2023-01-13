### Centos 无法运行 puppeteer

```bash
#依赖库
yum install pango.x86_64 libXcomposite.x86_64 libXcursor.x86_64 libXdamage.x86_64 libXext.x86_64 libXi.x86_64 libXtst.x86_64 cups-libs.x86_64 libXScrnSaver.x86_64 libXrandr.x86_64 GConf2.x86_64 alsa-lib.x86_64 atk.x86_64 gtk3.x86_64 -y
 

#字体
yum install ipa-gothic-fonts xorg-x11-fonts-100dpi xorg-x11-fonts-75dpi xorg-x11-utils xorg-x11-fonts-cyrillic xorg-x11-fonts-Type1 xorg-x11-fonts-misc -y

#启动浏览器代码加上参数：
const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});

```

## 参考连接

* [如何使用 GitHub Actions 和 Puppeteer 设置持续集成管道](https://www.freecodecamp.org/chinese/news/continuous-integration-with-github-actions-and-puppeteer/)
* [puppeteer API](https://pptr.dev/api/puppeteer.frame)
## Changelog

* 2022-07-12


 // "puppeteer": "^13.5.1"