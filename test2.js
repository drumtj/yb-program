const ChromeLauncher = require('chrome-launcher');
const {PROXY_SERVER, PROXY_ZONE_NAME, PROXY_ZONE_PASSWORD} = require('./config.js');
const chromeUrl = __dirname + "/chromium/chrome.exe";
const pathToExtension = __dirname + '/extensions/proxy_login';

let opt = [
  '--disable-gpu',
  '--exclude-switches=enable-automation,disable-extensions',
  '--disable-features=IsolateOrigins,site-per-process',
  '--disable-background-downloads',
  '--disable-sync',
  '--restore-last-session',
  // '--ignore-certifcate-errors',
  // '--ignore-certifcate-errors-spki-list'
  `--proxy-server=${PROXY_SERVER}`,
  `--load-extension=${pathToExtension}`
]

ChromeLauncher.launch({
  startingUrl: 'https://www.bet365.com',
  ignoreDefaultFlags: true,
  chromePath: chromeUrl,
  chromeFlags: opt
}).then(chrome => {
  console.log(`Chrome debugging port running on ${chrome.port}`);
});
