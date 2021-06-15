const {spawn, spawnSync} = require("child_process");
// const fs = require('fs');
// const fsp = fs.promises;
// const appDataPath = require('appdata-path')();
const path = require("path");
const {mkdir, appDataPath, getScreenSize} = require("./util.js");
const {USE_PROXY, PROXY_SERVER} = require('./config.js');
const fs = require("fs");
const dirname = process.cwd();//path.join(__dirname, process.cwd());
// const WS = require('window-size');
// const dirname = '__dirname;





// const proxyLoginExtensionPath = path.join(__dirname, "extensions/proxy_login");//__dirname + '/extensions/proxy_login';
// const mainExtensionPath = path.join(__dirname, "extensions/main");//__dirname + '/extensions/main';
const proxyLoginExtensionPath = dirname + '/extensions/proxy_login';
const proxySwitchExtensionPath = dirname + '/extensions/proxy_switch';
const mainExtensionPath = dirname + '/extensions/main';
// const chromeUrl = dirname + "/chromium/chrome.exe";
const rootFolder = 'yb';



// console.log(proxyLoginExtensionPath);
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

function getRand(){
  return '' + Date.now() + Math.floor(Math.random()*100000);
}

module.exports = async function chrome(chromePath, bid, index, headless, startingUrl, proxy){
  // pid = Date.now()+'_'+(Math.ceil(Math.random()*0xffffff)).toString(16);
  // pid = '1607533699297_e13f10';//-> 프로그램 id로 하면 될듯.

  // console.error("??",proxy);
  if(proxy){
    if(proxy.zone){
      let proxyExtensionManifest = JSON.parse(fs.readFileSync(proxyLoginExtensionPath + '/manifest.json', "utf8"));
      proxyExtensionManifest.proxy = proxy;
      fs.writeFileSync(proxyLoginExtensionPath + '/manifest.json', JSON.stringify(proxyExtensionManifest));
    }

    let proxySwitchExtensionManifest = JSON.parse(fs.readFileSync(proxySwitchExtensionPath + '/manifest.json', "utf8"));
    proxySwitchExtensionManifest.proxy = proxy;
    fs.writeFileSync(proxySwitchExtensionPath + '/manifest.json', JSON.stringify(proxySwitchExtensionManifest));
  }


  let screen = getScreenSize();
  // console.log(screen);
  let row = 4;
  let col = 4;
  let width = screen.width/col;
  let height = screen.height/row;
  let minWidth = 1920/col;
  let minHeight = 1080/row;

  // minWidth = width = 500;
  // minHeight = height = 270;

  let position = [
    Math.floor(width*(index%col)),
    Math.floor(height*Math.floor(index/col))
  ].join();
  let size = [Math.max(width, minWidth), Math.max(height, minHeight)].join();
  let userFolder;

  // console.log({position, size});

  let opt = [
    //지원하지않음
    // ' --no-sandbox',
    // '--disable-gpu',
    // '--exclude-switches=enable-automation,disable-extensions',
    '--disable-features=IsolateOrigins,site-per-process',
    //'--no-startup-window',
    // '--noerrordialogs',
    //'--disable-session-crashed-bubble',
    // '--disable-background-downloads',
    '--disable-sync',// Google 계정에 동기화 비활성화
    // '--enable-automation' -> 벳삼에서 막힘
    '--disable-save-password-bubble',//암호저장ui 비활
    '--disable-domain-reliability',//도메인 안정성 모니터링을 사용 중지합니다.
    '--metrics-recording-only',//UMA에 대한보고를 비활성화하지만 수집은 허용합니다
    // '--in-process-gpu', //GPU 프로세스를 브라우저 프로세스 스레드로 이동하여 일부 메모리 절약
    `--window-position=${position}`,
    `--window-size=${size}`,
    //이거사용하면 브라우져 멈춤
    // '--use-gl=egl'
    //이걸 사용하려하면 벳삼이 감지한다.
    // '--remote-debugging-port=0'
    //지원하지않음인데 되는듯.
    // '--disable-web-security',
    //지원하지않음
    // '--disable-site-isolation-trials',
    // '--disable-features=NetworkService,NetworkServiceInProcess'
    // 코드 무결성검사 비활
    // --disable-features = RendererCodeIntegrity
    // '--user-agent=Mozilla/5.0 (Linux; Android 7.0; SM-G930V Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.125 Mobile Safari/537.36'//x
    '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
    '--disable-features=UserAgentClientHint'
    // '--use-mobile-user-agent=true'//x
    // '--autoplay-policy=no-user-gesture-required',
    // '--disable-infobars'// x

    // '--restore-last-session',
    // '--ignore-certifcate-errors',
    // '--ignore-certifcate-errors-spki-list'
  ]

  if(headless){
    opt.push('--headless');
  }

  let extensionPath = [mainExtensionPath];
  extensionPath.push(proxySwitchExtensionPath  );

  if(USE_PROXY){
    if(proxy){
      // if(proxy.useCustomProxy){
      // }else{
        if(proxy.zone){
          // console.log("proxyServer", proxy.server);
          // opt.push(`--proxy-server=${PROXY_SERVER}`);
          opt.push(`--proxy-server=${proxy.server}`);
          extensionPath.push(proxyLoginExtensionPath);
        }
      // }
    }
  }

  opt.push(`--load-extension=${extensionPath.join()}`);
  // console.error(`--load-extension=${extensionPath.join()}`);



  if(bid){
    userFolder = path.join(appDataPath, rootFolder, bid);
    opt.push('--user-data-dir=' + userFolder);
    await mkdir(userFolder);
  }

  if(startingUrl){
    opt.push(startingUrl + '&r=' + getRand());
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
  return spawn(chromePath, opt);
  // return p.pid;
}
