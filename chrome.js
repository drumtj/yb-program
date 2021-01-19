const {spawn, spawnSync} = require("child_process");
// const fs = require('fs');
// const fsp = fs.promises;
// const appDataPath = require('appdata-path')();
const path = require("path");
const {mkdir, appDataPath} = require("./util.js");
const {USE_PROXY, PROXY_SERVER} = require('./config.js');
const fs = require("fs");
const dirname = process.cwd();//path.join(__dirname, process.cwd());
// const dirname = '__dirname;

// const proxyLoginExtensionPath = path.join(__dirname, "extensions/proxy_login");//__dirname + '/extensions/proxy_login';
// const mainExtensionPath = path.join(__dirname, "extensions/main");//__dirname + '/extensions/main';
const proxyLoginExtensionPath = dirname + '/extensions/proxy_login';
const mainExtensionPath = dirname + '/extensions/main';
const chromeUrl = dirname + "/chromium/chrome.exe";
const rootFolder = 'yb';

console.log(proxyLoginExtensionPath);
//proxyExtensionManifest.test = '??';

//console.log(JSON.parse(fs.readFileSync(proxyLoginExtensionPath + '/manifest_test.json', "utf8")));

// console.log("dirname", dirname);
// console.log("execPath", process.execPath);
// console.log("cwd", process.cwd());
// async function mkdir(_path){
//   try{
//     await fsp.access(_path, fs.constants.R_OK | fs.constants.W_OK);
//   }catch(e){
//     await fsp.mkdir(_path, {recursive:true});
//   }
// }
module.exports = async function chrome(bid, headless, startingUrl, proxy){
  // pid = Date.now()+'_'+(Math.ceil(Math.random()*0xffffff)).toString(16);
  // pid = '1607533699297_e13f10';//-> 프로그램 id로 하면 될듯.

  // console.error("??",proxy);
  if(proxy){
    let proxyExtensionManifest = JSON.parse(fs.readFileSync(proxyLoginExtensionPath + '/manifest.json', "utf8"));
    proxyExtensionManifest.proxy = proxy;
    fs.writeFileSync(proxyLoginExtensionPath + '/manifest.json', JSON.stringify(proxyExtensionManifest));

    let mainExtensionManifest = JSON.parse(fs.readFileSync(mainExtensionPath + '/manifest.json', "utf8"));
    mainExtensionManifest.proxy = proxy;
    fs.writeFileSync(mainExtensionPath + '/manifest.json', JSON.stringify(mainExtensionManifest));
  }

  let userFolder;

  let opt = [
    '--disable-gpu',
    // '--exclude-switches=enable-automation,disable-extensions',
    '--disable-features=IsolateOrigins,site-per-process',
    '--disable-background-downloads',
    '--disable-sync',
    // '--restore-last-session',
    // '--ignore-certifcate-errors',
    // '--ignore-certifcate-errors-spki-list'
  ]

  if(headless){
    opt.push('--headless');
  }

  let extensionPath = [mainExtensionPath];

  if(USE_PROXY){
    opt.push(`--proxy-server=${PROXY_SERVER}`);
    extensionPath.push(proxyLoginExtensionPath);
  }

  opt.push(`--load-extension=${extensionPath.join()}`);
  // console.error(`--load-extension=${extensionPath.join()}`);



  if(bid){
    userFolder = path.join(appDataPath, rootFolder, bid);
    opt.push('--user-data-dir=' + userFolder);
    await mkdir(userFolder);
  }

  if(startingUrl){
    opt.push(startingUrl);
  }

  // console.log(userFolder);


  // return ChromeLauncher.launch({
  //   startingUrl: 'https://www.bet365.com',
  //   ignoreDefaultFlags: true,
  //   chromePath: chromeUrl,
  //   chromeFlags: opt
  // })

  // .then(chrome => {
  //   console.log(`Chrome debugging port running on ${chrome.port}`);
  // });
  // execSync(chromeUrl);
  // execSync(chromeUrl + ' ' + opt.join(' '));
  return spawn(chromeUrl, opt);
  // return p.pid;
}
