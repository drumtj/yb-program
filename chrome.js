const {spawn, spawnSync} = require("child_process");
// const fs = require('fs');
// const fsp = fs.promises;
// const appDataPath = require('appdata-path')();
const path = require("path");
const {mkdir, appDataPath} = require("./util.js");
const {USE_PROXY, PROXY_SERVER} = require('./config.js');

const proxyLoginExtensionPath = __dirname + '/extensions/proxy_login';
const mainExtensionPath = __dirname + '/extensions/main';
const chromeUrl = __dirname + "/chromium/chrome.exe";
const rootFolder = 'yb';

// async function mkdir(_path){
//   try{
//     await fsp.access(_path, fs.constants.R_OK | fs.constants.W_OK);
//   }catch(e){
//     await fsp.mkdir(_path, {recursive:true});
//   }
// }
module.exports = async function chrome(bid, headless, startingUrl){
  // pid = Date.now()+'_'+(Math.ceil(Math.random()*0xffffff)).toString(16);
  // pid = '1607533699297_e13f10';//-> 프로그램 id로 하면 될듯.

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
