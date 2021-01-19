const {v4:uuidv4} = require('uuid');
const chromeOpen = require('./chrome');
const {LOCAL_MAIN_URL} = require('./config');
// const api = require('./api');
const API = require('./api');
let api;
const {getParamString} = require('./util');
let EMAIL;

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

  // let browserInfo = await api.loadBrowser(bid);
  // if(browserInfo.status != "success"){
  //   console.error(bid, "브라우져 정보 가져오기 실패", browserInfo.message);
  //   return;
  // }
  // console.error(browserInfo);
  let countryCode = browserData.account.country;
  let proxy = await api.getProxy(countryCode);
  if(proxy.status != "success"){
    console.error(bid, "프록시 정보 가져오기 실패", proxy.message);
    return;
  }

  // console.log(browserData.option);
  // console.log(browserData.option.dataType);
  // console.log(browserData.option.data.dataType=="betburger" || browserData.option.data.action == "checkBetmax");

  let paramObj = {
    bid,
    email:EMAIL,
    countryCode,
    needPnc: browserData.option.data.dataType=="betburger" || browserData.option.data.action == "checkBetmax"
  }
  let paramStr = getParamString(paramObj);



  let prc = await chromeOpen(bid, false, LOCAL_MAIN_URL + '?' + paramStr, proxy.data);
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

async function getLivingBrowsers(){
  let r = {};
  for(let bid in browsers){
    r[bid] = await emitPromise(bid, "getState");
  }
  return r;

  // return Object.keys(browsers).reduce(async (r,v)=>{
  //   // emit(v, "test", null);
  //   let state = await emitPromise(v, "getState");
  //   r[v] = state;
  //   return r;
  // }, {})

  // return Object.keys(browsers);

  // .reduce((r,bid)=>{
  //   r[bid] = browsers[bid].killed;
  //   return r;
  // }, {})
}

let resolveList = {};
function setSocket(bid, socket){
  if(!browsers[bid]){
    // console.error(`setSocket 브라우져(${bid})가 없습니다.`);
    return;
  }

  browsers[bid].socket = socket;

  socket.on("resolve", (data, uuid)=>{
    if(resolveList[uuid]){
      resolveList[uuid](data);
      delete resolveList[uuid];
    }
  })
}

function getSocket(bid){
  if(bid === undefined){
    return Object.keys(browsers).map(k=>browsers[k].socket);
  }
  if(!browsers[bid]){
    // console.error(`getSocket 브라우져(${bid})가 없습니다.`);
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

function emitTo(room, event, data){
  // console.log("emitTo:", room);
  io.to(room).emit(event, data);
}

function emitAll(event, data){
  getSocket().forEach(socket=>socket.emit(event, data))
}

function emitPromise(bid, event, data){
  let socket = getSocket(bid);
  if(socket){
    let id = uuidv4();
    socket.emit(event, data, id);
    return new Promise(resolve=>{
      resolveList[id] = resolve;
    })
  }else{
    return Promise.resolve();
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

function sendDataToMain(bid, com, data){
  // emit(bid, com, data);
  let socket = getSocket(bid);
  if(socket){
    socket.emit("sendData", {com, data, to:"main"});
  }
}


function setEmail(email){
  EMAIL = email;
  api = API(email);
}

let io;
function setIO(_io){
  io = _io;
}

function join(bid, room){
  let socket = getSocket(bid);
  if(socket){
    // console.log("join room:", room);
    socket.join(room);
  }
}

function leave(bid, room){
  let socket = getSocket(bid);
  if(socket){
    socket.leave(room);
  }
}

module.exports = {
  emitTo,
  leave,
  join,
  setIO,
  setEmail,
  getBrowser,
  getBrowsers,
  openBrowser,
  closeBrowser,
  getLivingBrowsers,
  listener,
  setSocket,
  getSocket,
  emit,
  emitAll,
  emitPromise,
  sendDataToBg,
  sendDataToBet365,
  closeBrowserAll
}
