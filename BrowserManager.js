const chromeOpen = require('./chrome');
const {LOCAL_MAIN_URL, EMAIL} = require('./config');

var browsers = {};
Object.defineProperty(browsers, "kill", {
  value: function(){
    Object.keys(this).forEach(bid=>{
      if(this[bid].kill){
        this[bid].kill();
        delete this[bid];
      }
    })
  },
  enumerable: false,
  writable: false
})

let listener = {
  onClosed: null
}

function getBrowser(bid){
  return browsers[bid];
}

function getBrowsers(){
  return browsers;
}

async function openBrowser(bid, browserData){
  // let bid = browserData._id;
  console.log("브라우져 열기", bid);
  if(browsers[bid]){
    console.error(bid, "이미 열려있는 브라우져");
    return;
  }

  let prc = await chromeOpen(bid, false, LOCAL_MAIN_URL + `?bid=${bid}&email=${EMAIL}`);
  let browser = createBrowswerObject(prc, browserData);
  browsers[bid] = browser;
  prc.on('exit', function (code) {
    console.log('브라우져 종료됨', bid, 'code:' + code);
    browser.killed = true;
    delete browsers[bid];
    if(typeof listener.onClosed === "function"){
      listener.onClosed(bid);
    }
  });
  if(typeof listener.onOpened === "function"){
    listener.onOpened(bid);
  }
  // console.log(prc);
  // napi.setForegroundWindow(prc.pid);
  // console.log(napi.BringWindowToTop(prc.pid));
  return browser;
}

function createBrowswerObject(prc, browserData){
  let browser = {
    data: browserData,
    process: prc,
    killed: false,
    kill: function(){
      if(!this.killed){
        prc.kill('SIGINT');
        this.killed = true;
      }
    }
  };

  return browser;
}

function closeBrowser(bid){
  if(!browsers[bid]){
    console.error(bid, "이미 닫힌 브라우져");
    return;
  }

  browsers[bid].kill();
  delete browsers[bid];
}

function closeBrowserAll(){
  browsers.kill();
}

function getLivingBrowsers(){
  return Object.keys(browsers);
  // .reduce((r,bid)=>{
  //   r[bid] = browsers[bid].killed;
  //   return r;
  // }, {})
}

function setSocket(bid, socket){
  if(!browsers[bid]){
    console.error(`setSocket 브라우져(${bid})가 없습니다.`)
    return;
  }

  browsers[bid].socket = socket;
}

function getSocket(bid){
  if(!browsers[bid]){
    console.error(`getSocket 브라우져(${bid})가 없습니다.`)
    return;
  }

  return browsers[bid].socket;
}

// 여기의 소켓은 브라우져 소켓탭과 프로그램간 통신이다.
// 브라우져 소켓탭의 소켓.
function emit(bid, event, data){
  let socket = getSocket(bid);
  if(socket){
    socket.emit(event, data);
  }
}

function sendDataToBg(bid, com, data){
  // console.error("sendDataToBg", com, data);
  let socket = getSocket(bid);
  if(socket){
    socket.emit("sendData", {com, data, to:"bg"});
  }
}

function sendDataToBet365(bid, com, data){
  let socket = getSocket(bid);
  if(socket){
    socket.emit("sendData", {com, data, to:"bet365"});
  }
}

module.exports = {
  getBrowser,
  getBrowsers,
  openBrowser,
  closeBrowser,
  getLivingBrowsers,
  listener,
  setSocket,
  getSocket,
  emit,
  sendDataToBg,
  sendDataToBet365,
  closeBrowserAll
}
