// const vanillaPuppeteer = require('puppeteer');
// const {addExtra} = require('puppeteer-extra');
// const puppeteer = addExtra(vanillaPuppeteer);
const puppeteer = require('puppeteer-extra');

const StealthPlugin = require('puppeteer-extra-plugin-stealth');
// const Recaptcha = require('puppeteer-extra-plugin-recaptcha');
// const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');

const { parentPort, workerData } = require("worker_threads");
const fs = require('fs');
const {USE_PROXY, BLOCK_RESOURCE, HOST_URL, BROWSER_SYNC_CONTROL, PROXY_ZONE_NAME, PROXY_ZONE_PASSWORD, PROXY_ZONE, PROXY_API_TOKEN, PROXY_CUSTOMER} = require('../config.js');

puppeteer.use(StealthPlugin());
// puppeteer.use(Recaptcha());
// puppeteer.use(AdblockerPlugin({ blockTrackers: true }));
// let page;
//
(async ()=>{
  const puppeteerOptions = {
    headless: false,
    devtools: !true,
    // ignoreHTTPSErrors: true,
    // timeout : 0,
    // 브라우저에서 Ctrl + C 버튼을 클릭하여 프로세스를 종료시킬 수 있다.
    handleSIGINT: false,
    // 실행한 터미널에서 Ctrl + C 버튼을 클릭하여 프로세스를 종료시킬 수 있다.
    handleSIGTERM: false,
    handleSIGHUP: false,
    
    args: [
      '--disable-gpu',
      '--disable-background-downloads',
      '--disable-sync',
      '--restore-last-session',
      // '--no-sandbox',
      // '--disable-setuid-sandbox',
      '--disable-features=IsolateOrigins,site-per-process',
      // '--disable-infobars',
      '--ignore-certifcate-errors',
      '--ignore-certifcate-errors-spki-list',
      // '--disable-site-isolation-trials',
      // '--disable-features=NetworkService,NetworkServiceInProcess',
      // '--enable-automation',
      '--user-agent="Mozilla / 5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit / 537.36 (KHTML, like Gecko) Chrome / 65.0.3312.0 Safari / 537.36"'

      // '--unhandled-rejections=strict',
      // '--proxy-server=zproxy.lum-superproxy.io:22225',
      // `--disable-extensions-except=${pathToExtension}`,
      // `--load-extension=${pathToExtension}`
    ]
  }

  if(USE_PROXY){
    puppeteerOptions.args.push('--proxy-server=zproxy.lum-superproxy.io:22225');
  }

  if(workerData.width){
    puppeteerOptions.defaultViewport = {
      width: workerData.width,
      height: workerData.height
    }
    puppeteerOptions.args.push(`--window-size=${workerData.width},${workerData.height}`);
  }

  if(workerData.position){
    puppeteerOptions.args.push(`--window-position=${workerData.position}`);
  }

  // const browser = await puppeteer.launch({headless:false});
  // const page = await browser.newPage();
  // await page.goto('https://www.bet365.com');


  const browser = await puppeteer.launch(puppeteerOptions);
  const page0 = (await browser.pages())[0];
  const context = await browser.createIncognitoBrowserContext();
  const page = await context.newPage();
  await page0.close();

  return;
  // const preloadFile = fs.readFileSync('./preload.js', 'utf8');
  // await page.evaluateOnNewDocument(preloadFile);

  // await page.emulate({
  //   'name': 'iPad Pro landscape',
  //   'userAgent': 'Mozilla/5.0 (iPad; CPU OS 11_0 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) Version/11.0 Mobile/15A5341f Safari/604.1',
  //   'viewport': {
  //     'width': 1366,
  //     'height': 1024,
  //     'deviceScaleFactor': 2,
  //     'isMobile': true,
  //     'hasTouch': true,
  //     'isLandscape': true
  //   }
  // });

  if(USE_PROXY){
    await page.authenticate({
        username: PROXY_ZONE_NAME,
        password: PROXY_ZONE_PASSWORD
    });
  }

  if(BLOCK_RESOURCE){
    // 바로 continue해도 작동안한다.
    // 이부분은 크롬익스텐션으로 블로킹하는것으로 하자.
    // 브라우져 실행시 로컬에 있는 익스텐션을 로드하도록.

    // await page.setRequestInterception(true);
    // page.on('request', (request) => {
    //   let type = request.resourceType();
    //   console.log("resorce type", type);
    //   switch(type){
    //     case "image":
    //       const headers = Object.assign({}, request.headers(), {
    //         url:HOST_URL + '/assets/img/1x1.png'
    //       });
    //       request.continue({headers});
    //     break;
    //
    //     default:
    //       request.continue();
    //   }
    // });
  }

  // if(workerData.width){
  //   page.setViewport({width: workerData.width, height: workerData.height - 150});
  // }
  // const page = await browser.newPage();
  // const page = await browser.pages(0);

  parentPort.on('message', onMessage);
  // parentPort.once('message', (message) => {
  //   console.error('send', page);
  //   parentPort.postMessage(page);
  // });


  async function onMessage(message){
    let {com, data, key} = message;
    let resultData;
    switch(com){
      case "goto":
        await page.goto(data);
      break;

      case "click":
        // page.evaluate(()=>{
        //   console.error('click', data);
        // })
        await page.mouse.click(data.x, data.y);
      break;

      case "char":
        await page.keyboard.sendCharacter(data);
      break;

      case "type":
        // page.evaluate(()=>{
        //   console.error('type', data);
        // })
        await page.type(data.selector, data.value);
      break;

      case "dispose":
        await browser.close();
      break;

      case "pinnacle":

        // await page.goto(data.url);
        // await page.waitForSelector("#usernameInput", {visible:true});
        // await page.type("#usernameInput", "tj"+Math.round(Math.random()*1000));
        // await page.tap("#btn_play");
        //

        await page.exposeFunction('sendData', (com, data) => {
          // data.id = workerData.index;
          // console.error("receive", com, data);
          parentPort.postMessage({com:"receiveData", data:{com,data}});
        });

        await page.goto(data.url, { waitUntil : "networkidle2" });
        // await page.goto(data.url);
        // await page.addScriptTag({url: "https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"});
        await page.addScriptTag({url: "https://cdnjs.cloudflare.com/ajax/libs/axios/0.21.0/axios.min.js"});
        await page.addScriptTag({url: HOST_URL + '/js/program/util.js'});
        await page.addScriptTag({url: 'https://jsgetip.appspot.com'});
        await page.addScriptTag({url: HOST_URL + '/js/program/connect.js'});
        await page.addScriptTag({url: HOST_URL + '/js/program/pinnacle.js'});

        // await page.waitForSelector("#pinNumber", {visible:true});
        // await page.type("#pinNumber", data.roomNum);
        // await page.type("#sender", "tj"+(workerData.index+1)+Math.floor(Math.random()*100));
        // await page.tap("#openpincheck");
        try{
          await page.waitForNavigation();
        }catch(e){

        }
        // await page.waitForSelector(".wrap-midst", {visible:true});


        if(BROWSER_SYNC_CONTROL){
          if(workerData.index == 0){
            await page.exposeFunction('clickBroadcast', pos => {
              pos.id = workerData.index;
              // console.error("clickBroadcast", pos);
              parentPort.postMessage({com:"clickBroadcast", data:pos});
            });

            await page.exposeFunction('inputBroadcast', data => {
              data.id = workerData.index;
              // console.error("inputBroadcast", data);
              parentPort.postMessage({com:"inputBroadcast", data:data});
            });

            // await page.exposeFunction('changeBroadcast', data => {
            //   data.id = workerData.index;
            //   console.error("changeBroadcast", data);
            //   parentPort.postMessage({com:"changeBroadcast", data:data});
            // });

            page.on('domcontentloaded', e=>{
              page.evaluate(()=>{
                console.error("hi1");
                window.addEventListener('click', e=>{
                  console.error("click", e.clientX, e.clientY);
                  window.clickBroadcast({x:e.clientX, y:e.clientY});
                })

                window.addEventListener('input', e=>{
                  console.error('input', e);
                  window.inputBroadcast({value:e.data});
                })
              })
            })
          }else{
            page.on('domcontentloaded', e=>{
              page.evaluate(()=>{
                console.error("hi2");
                window.addEventListener('click', e=>{
                  console.error(e.clientX, e.clientY);
                })
                window.addEventListener('input', e=>{
                  console.error('input', e.data);
                })
              })
            })
          }
        }
      break;
    }

    if(key){
      parentPort.postMessage({data:resultData, key});
    }
  }
})()

// if(!page){
//   page = await browser.newPage();
// }
// const page = await browser.newPage();

////////////////////////////////////////////////////////////
////////////////// luminati proxy
////////////////////////////////////////////////////////////
// 프록시 사용법
// https://luminati.io/integration/puppeteer?hl=ko
//
// await page.authenticate({
//     username: PROXY_ZONE_NAME,
//     password: PROXY_ZONE_PASSWORD
// });



// const handle = await page.evaluateHandle(() => ({window, document}));
// const properties = await handle.getProperties();
// const windowHandle = properties.get('window');
// const documentHandle = properties.get('document');
// await handle.dispose();



////////////////////////////////////////////////////////////
////////////// chrome extension background page
////////////////////////////////////////////////////////////
// const targets = await browser.targets();
// const backgroundPageTarget = targets.find(target => target.type() === 'background_page');
// const backgroundPage = await backgroundPageTarget.page();


////////////////////////////////////////////////////////////
/////////////// interceptedRequest /////////////////////////
////////////////////////////////////////////////////////////
// await page.setRequestInterception(true);
// page.on('request', interceptedRequest => {
//   if (interceptedRequest.url().endsWith('.png') || interceptedRequest.url().endsWith('.jpg'))
//     interceptedRequest.abort();
//   else
//     interceptedRequest.continue();
// });

// page.on('console', msg => console.log(msg.text()));
//
//
// await page.goto(url);
// await page.goto('http://lumtest.com/myip.json');

/////////////////////////////////////////////////////////////
//////////////// handling
/////////////////////////////////////////////////////////////
// const resultHandle = await page.evaluateHandle(() => document.body.innerHTML);
// console.log(await resultHandle.jsonValue());
// await resultHandle.dispose();

///////////////////////////////////////////////////////////////
///////////////// element click
///////////////////////////////////////////////////////////////
// // const button = await page.evaluateHandle(() => document.querySelector('a.gb_g[data-pid="23"]'));
// const button = await page.$('a.gb_g[data-pid="23"]');
// console.error("find button");
// // button is an ElementHandle, so you can call methods such as click:
// await button.click();
// await page.waitForNavigation();
// console.error("click complete");

// await page.$$()
// //await frame.type('#mytextarea', 'World', {delay: 100});
// console.error()
///////////////////////////////////////////////////////////////
// await page.type('#realbox', 'browserless', {delay: 100});
// console.log(await page.url());

//////////////////////////////////////////////////////////////
// await page.exposeFunction('test', text =>{
//   console.log(text);
// });
// await page.evaluate(async () => {
//   // use window.md5 to compute hashes
//   const myString = 'PUPPETEER';
//   window.test(myString);
// });


///////////////////////////////////////////////////////////
// await page.emulateVisionDeficiency('achromatopsia');
// await page.screenshot({ path: 'achromatopsia.png' });
//
// await page.emulateVisionDeficiency('deuteranopia');
// await page.screenshot({ path: 'deuteranopia.png' });
//
// await page.emulateVisionDeficiency('blurredVision');
// await page.screenshot({ path: 'blurred-vision.png' });

// await page.screenshot({ path: `screenshot_${name}.png` });
// await pause();
//////////////
// await page.emulateMediaType('screen');
// await page.pdf({path: 'page.pdf'});
// pages.push(page);
// await pause();
// await page.close();
