const {v4:uuidv4} = require('uuid');
const chromeOpen = require('./chrome');
const {LOCAL_MAIN_URL, USE_PROXY} = require('./config');
const LuminatiAPI = require('./luminatiAPI');
// const api = require('./api');
const API = require('./api');
let api, luminati;
const {getParamString} = require('./util');
let EMAIL;

var browsers = {};
let chromePath;
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

async function openBrowser(bid, browserData, index){
  // let bid = browserData._id;
  // require('./test');
  console.log("open browser", bid);
  if(browsers[bid]){
    console.error(bid, "Browser already open");
    return;
  }


  // let balance = await luminati.balance();
  // // console.log("balance", balance);
  // if(!balance.status == 'fail'){
  //   console.error("[PROXY] " + balance.message);
  //   return {
  //     status: "fail",
  //     message: "[PROXY] " + balance.message
  //   };
  // }
  //
  // if(balance.data.balance - balance.data.pending_costs <= 0){
  //   console.error("[PROXY] need more balance. luminati API");
  //   return {
  //     status: "fail",
  //     message: "[PROXY] need more balance. luminati API"
  //   };
  // }


  // let browserInfo = await api.loadBrowser(bid);
  // if(browserInfo.status != "success"){
  //   console.error(bid, "브라우져 정보 가져오기 실패", browserInfo.message);
  //   return;
  // }
  let countryCode = browserData.account.country;
  // console.error(browserData);

  let proxyData;

  /// test
  // browserData.proxyHttp = "124.198.111.32:11959";

  if(browserData.proxy){
    proxyData = {
      useCustomProxy: true,
      proxyHttp: browserData.proxy.proxyHttp
    }
  }else{
    let proxy = await api.getProxy(countryCode);
    // console.log({proxy});
    if(proxy.status != "success"){
      console.error(bid, "proxy loading failure.", proxy.message);
      return {
        status: "fail",
        message: "proxy loading failure." + proxy.message
      };
    }

    //////////// 210307
    if(proxy.data){
      let balance = await luminati.balance();
      // console.log("balance", balance);
      if(!balance.status == 'fail'){
        console.error("[PROXY] " + balance.message);
        return {
          status: "fail",
          message: "[PROXY] " + balance.message
        };
      }

      if(balance.data.balance - balance.data.pending_costs <= 0){
        console.error("[PROXY] need more balance. luminati");
        return {
          status: "fail",
          message: "[PROXY] need more balance. luminati"
        };
      }
      proxyData = proxy.data;
    }
  }
  ///////////////////

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



  let prc = await chromeOpen(chromePath, bid, index, false, LOCAL_MAIN_URL + '?' + paramStr, proxyData);
  let browser = createBrowswerObject(prc, browserData);
  browsers[bid] = browser;
  prc.on('exit', function (code) {
    console.log('Browser Closed', bid, 'code:' + code);
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
    console.error(bid, "Browser already closed");
    return false;
  }

  browsers[bid].kill();
  delete browsers[bid];
  return true;
}

function closeBrowserAll(){
  browsers.kill();
}

async function getLivingBrowsers(){
  // let r = {};
  // for(let bid in browsers){
  //   r[bid] = await emitPromise(bid, "getState", null, 1000);
  // }
  // return r;
  let promises = [];
  let bids = [];
  Object.keys(browsers).forEach(bid=>{
    bids.push(bid);
    promises.push(emitPromise(bid, "getState", null, 2000));
  })
  let results = await Promise.all(promises);
  // console.log("getLivingBrowsers results", results)
  let r = results.reduce((r,v,i)=>{
    r[bids[i]] = v;
    return r;
  }, {})

  // console.log("r", r);

  return r;
  // emitPromise(bid, "getState", null, 1000);

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
    // console.log("resolve", data, uuid);
    // console.log("has resolve", resolveList[uuid]);
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

function emitPromise(bid, event, data, timeout=0){
  let socket = getSocket(bid);
  if(socket){
    let id = uuidv4();
    socket.emit(event, data, id);
    return new Promise(resolve=>{
      let itv;
      if(timeout>0){
        itv = setTimeout(()=>{
          delete resolveList[id];
          resolve();
        }, timeout)
      }
      resolveList[id] = (d)=>{
        clearTimeout(itv);
        resolve(d);
      }
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


async function setEmail(email){
  EMAIL = email;
  api = API(email);
  let res = await api.getProxy();
  luminati = LuminatiAPI(res.data.customer, res.data.token);
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

function setChromePath(path){
  chromePath = path;
}

module.exports = {
  emitTo,
  leave,
  join,
  setIO,
  setEmail,
  setChromePath,
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
