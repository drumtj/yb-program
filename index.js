const prompt = require('prompt');
const axios = require('axios');
const ioClient = require('socket.io-client');
const config = require('./config');
const util = require('./util');
const luminati = require('./luminatiAPI');
const API = require('./api');
var api;
// const chromeOpen = require('./chrome');
const http = require('http');
const express = require("express");
const path = require("path");
const BrowserManager = require("./BrowserManager");
// const napi = require("./napi");
const {v4:uuidv4} = require('uuid');
const cors = require('cors');
// const download = require('download-chromium');
// const fs = require('fs');

let pid, pdata, io, socket;



async function proxySetup(){
  if(!config.USE_PROXY){
    console.log("[PROXY] disabled.");
    return true;
  }

  let proxy = await api.getProxy();
  if(proxy.status != "success"){
    console.error(bid, "proxy loading failure.", proxy.message);
    return;
  }
  //
  // proxy.data = {
  //   "DE":{
  //     zone,
  //     user,
  //     pw
  //   }
  // }

  let proxyInfo = {};
  for(let countryCode in proxy.data){
    proxyInfo[proxy.data[countryCode].zone] = proxy.data[countryCode];
  }

  console.log("proxy info loaded");
  // console.log({proxyInfo});

  let balance = await luminati.balance();
  // console.log("balance", balance);
  if(!balance.status == 'fail'){
    console.error("[PROXY] " + balance.message);
    return false;
  }

  if(balance.data.balance - balance.data.pending_costs <= 0){
    console.error("[PROXY] need more balance. luminati API");
    return false;
  }

  // let ips = (await luminati.getIPs()).data[config.PROXY_ZONE];
  let ips = (await luminati.getIPs('*'));
  console.log("ip zone loaded");

  if(ips.status != "success"){
    console.error("luminati get ips error");
    process.exit();
  }
  // ips =
  // {
  //    status: "success",
  //     data: {
  //      "ZONE1": ["456.123.456", "123.456.789"],
  //      "ZONE2": ["456.123.456", "123.456.789"]
  //    }
  // }
  // console.log("ips", ips);
  let ip = (await util.getIP()).ip;
  console.log("IP", ip);

  for(let zone in proxyInfo){
    if(ips.data[zone].indexOf(ip) == -1){
      console.log(`PROXY ${zone}에 ip(${ip})등록 시작`);
      await luminati.addIP(zone, ip);
      console.log(`PROXY ${zone}에 ip(${ip})등록 완료`);
    }
  }

  // if(ips.indexOf(ip) == -1){
  //   console.log(`PROXY에 ip(${ip})등록 시작`);
  //   await luminati.addIP(ip);
  //   console.log(`PROXY에 ip(${ip})등록 완료`);
  // }

  return true;
}

var EMAIL;

function getInDataGroup(){
  let r = [];
  if(socketGroups["gamedata"] && Object.keys(socketGroups["gamedata"]).length){
    r.push("__data_receiver__");
  }
  if(socketGroups["gamedata2"] && Object.keys(socketGroups["gamedata2"]).length){
    r.push("__data_receiver2__");
  }
  return r;
}

function socketSetup(setupSocketEvent){
  return new Promise((resolve, reject)=>{
    let socket = ioClient(config.SOCKET_URL, { transports: ['websocket'] });
    socket.on("connect", async ()=>{
      console.log("socket connected!");
      socketGroups
      socket.emit("init", {link:"__program__", pid:(await util.getData("PID")), groups:getInDataGroup()});//, email:config.EMAIL});

    })
    socket.on("email", data=>{
      // console.error("receive email", data);
      if(!data){
        reject();
        return;
      }
      EMAIL = data;
      BrowserManager.setEmail(data);
      BrowserManager.setChromePath(chromeIntallPath);
      api = API(data);
      resolve(socket);
    })
    if(typeof setupSocketEvent === "function" && socket){
      setupSocketEvent(socket);
    }
  })
}

async function inputPid(){
  let pid = await util.getData("PID");

  prompt.start();
  pid = await new Promise(resolve=>{
    if(pid){
      console.log("사용중이던 프로그램 ID가 존재합니다. 그냥 엔터치시면 사용합니다.");
    }
    prompt.get({
      properties: {
        pid:{
          description: '프로그램 ID를 입력하세요.',
          default: pid || undefined,
          required: true
        }
      }
    }, async (err, result)=>{
      if(err){
        console.log(err);
        resolve(false);
        return;
      }

      resolve(result.pid || pid);
    })
  })
  prompt.stop();

  await util.setData("PID", pid);

  console.log("PID", pid);
  return pid;
}

async function keySetup(){


  //# pid 검증
  let pidCheck = await api.checkPID(pid);
  if(pidCheck.status == "fail"){
    console.error(pidCheck.message);
    return false;
  }

  if(pid){
    console.log("Program ID authentication completed");
    await util.setData("PID", pid);
  }else{
    console.log("Program ID authentication failure");
    await util.setData("PID", '');
  }

  return pid;
}

async function loadInfo(pid){
  console.log("programs info loading..");
  let res = await api.loadProgram(pid);
  if(res.status == 'fail'){
    console.error("program info loading failure");
    return;
  }

  return res.data;
}

let chekerBid;
function localSocketServerSetup(setupSocketEvent){
  const app = express();
  const server = http.Server(app);
  const io = require("socket.io")(server);



  // 메인프로그램과 확장프로그램의 통신처리
  io.on('connection', socket=>{
    socket.on("initMainPage", data=>{
      BrowserManager.setIO(io);
      BrowserManager.setSocket(data.bid, socket);
      console.log("connect to browser:", data.bid, data);
      //BrowserManager.emit(data.bid, )
      // if(data.isChecker){
      //   chekerBid = data.bid;
      //   emitToServer("joinChecker");
      // }
    })

    setupSocketEvent(socket);
  })

  // console.log(path.join(__dirname, "public"));
  // console.log(path.join(process.cwd(), "public"));
  // app.use(express.static("public"));
  app.use('/', express.static(path.join(__dirname, "public")));
  app.use(cors());
  // app.use('/socket.io', express.static(path.join(__dirname, "public/socket.io")));
  // app.use(express.static(path.join(process.cwd(), "public")));


  // app.get('/', function (req, res) {
  //   res.send('home');
  // });
  // app.get('/test', function (req, res) {
  //   res.send('test');
  // });

  return new Promise(resolve=>{
    server.listen(8080, ()=>{
      console.log('local server ready');
      resolve(io);
    });
  })
}



let socketResolveList = {};

function emitPromise(com, data, bid){
  if(socket){
    let uuid = uuidv4();
    socket.emit(com, data, bid, uuid);
    return new Promise(resolve=>{
      socketResolveList[uuid] = resolve;
    })
  }
  return Promise.resolve();
}

function emitToSite(com, data, bid=undefined){
  if(socket){
    socket.emit("delivery", {com, data}, bid);
  }
}

function emitToServer(event, data, bid){
  // console.log("emitToServer", {event, data, bid});
  if(socket){
    socket.emit(event, data, bid);
  }
}

function emitToServerPromise(event, data, bid){
  return emitPromise(event, data, bid);
}

function emitToSitePromise(event, data, bid){
  return emitPromise("delivery", {com, data}, bid);
}

function logToBrowser(bid, msg, type){
  emitToServer("log", {msg, type}, bid);
}

async function sendBrowserState(){
  // socket.emit("receiveLivingBrowsers", {pid: pid, bids:BrowserManager.getLivingBrowsers()});
  emitToSite("receiveLivingBrowsers", {pid: pid, browsers:await BrowserManager.getLivingBrowsers()});
}

let socketGroups = {};
let chromeIntallPath = process.cwd() + "/chromium/chrome.exe";

(async ()=>{

  // let chromeFolder = `${process.cwd()}/chromium`;
  // console.log("start download");
  // chromeIntallPath = await download({
  //   // platform = currentPlatform,
  //   // revision = '499413',
  //   log: true,
  //   onProgress: (obj)=>{
  //     let {percent, transferred, total} = obj;
  //     console.log(percent, transferred, total);
  //   },
  //   installPath: chromeFolder
  // })
  // // const exec = await download();
  // console.log(`Downloaded Chromium to ${chromeIntallPath}`);
  // console.log(`chromePath: ${chromePath}`);

  pid = await inputPid();

  console.log("socket connecting...");
  // 사이트와 프로그램이 통신하는 부분
  try{
    socket = await socketSetup(socket=>{

      // socket.on("setChecker", data=>{
      //   chekerBid = data.bid;
      //
      //   socket.on("gamedata", data=>{
      //     if(chekerBid){
      //       BrowserManager.emit(chekerBid, "gamedata", data);
      //     }
      //   })
      // })

      socket.on("toMain", async (data, uuid)=>{
        console.log("toMain", data, uuid);
        if(uuid){
          let r = await BrowserManager.emitPromise(data.bid, data.com, data.data);
          socket.emit("resolve", r, uuid);
        }else{
          BrowserManager.emit(data.bid, data.com, data.data);
        }
      })

      socket.on("toBet365", data=>{
        BrowserManager.sendDataToBet365(data.bid, data.com, data.data);
      })

      socket.on("toBg", data=>{
        BrowserManager.sendDataToBg(data.bid, data.com, data.data);
      })

      let chekerSocket;
      function onReceiveGamedata(data){
        console.log("receive gamedata", (new Date()).toLocaleTimeString());
        // BrowserManager.emitTo("gamedata", "gamedata", data);
        for(let bid in socketGroups["gamedata"]){
          BrowserManager.emit(bid, "gamedata", data);
        }
        // if(chekerBid){
        //   BrowserManager.emit(chekerBid, "gamedata", data);
        // }else{
        //   BrowserManager.emitAll("gamedata2", data);
        // }
      }

      function onReceiveGamedata2(data){
        console.log("receive gamedata2", (new Date()).toLocaleTimeString());
        // BrowserManager.emitTo("gamedata2", "gamedata2", data);
        for(let bid in socketGroups["gamedata2"]){
          BrowserManager.emit(bid, "gamedata2", data);
        }
        // if(chekerBid){
        //   BrowserManager.emit(chekerBid, "gamedata", data);
        // }else{
        //   BrowserManager.emitAll("gamedata2", data);
        // }
      }

      socket.on("openBrowser", async (bid, browser, index)=>{//, isChecker)=>{
        // console.log({bid, browser})
        // console.log("browser.option", browser.option);
        // let browserInfo = await api.loadBrowser(bid);
        // if(browserInfo.status != "success"){
        //   console.error(bid, "브라우져 정보 가져오기 실패", browserInfo.message);
        //   return;
        // }

        // if(isChecker){


        BrowserManager.leave(bid, "gamedata");
        BrowserManager.leave(bid, "gamedata2");

        let dataType = browser.option.data.dataType;
        if(browser.option.data.action == "checkBetmax"){
          dataType = "betburger";
          // chekerBid = bid;
          socket.emit("joinChecker", bid);
        }
        if(dataType == "betburger"){
          console.log("join gamedata");
          socket.emit("joinDataReceiver", bid);
          socket.off("gamedata");
          socket.on("gamedata", onReceiveGamedata);
          BrowserManager.join(bid, "gamedata");
          if(!socketGroups["gamedata"]) socketGroups["gamedata"] = {};
          socketGroups["gamedata"][bid] = 1;
          // console.log("!!", socketGroups["gamedata"][bid]);
        }else{//betmax
          console.log("join gamedata2");
          socket.emit("joinDataReceiver2", bid);
          socket.off("gamedata2");
          socket.on("gamedata2", onReceiveGamedata2);
          BrowserManager.join(bid, "gamedata2");
          if(!socketGroups["gamedata2"]) socketGroups["gamedata2"] = {};
          socketGroups["gamedata2"][bid] = 1;
        }
        let openResult = await BrowserManager.openBrowser(bid, browser, index);//{isChecker});
        if(openResult && openResult.status == "fail"){
          socket.emit("log", openResult.message, bid);
        }
      })

      socket.on("closeBrowser", bid=>{
        // if(chekerBid == bid){
        //   chekerBid = null;
        //   // socket.removeAllListeners("gamedata");
        //   socket.off("gamedata");
        // }
        let flag = BrowserManager.closeBrowser(bid);
        leaveDataGroup(bid);
        if(!flag){
          // 이미 닫혔다. 서버에 신호는 보내줘야지?
          emitToSite("closedBrowser", null, bid);
        }
      })

      socket.on("exit", ()=>{
        // BrowserManager.closeBrowserAll();
        process.exit();
      })

      socket.on("getLivingBrowsers", ()=>{
        console.error("getLivingBrowsers");
        sendBrowserState();
      })

      // socket.on("getConnectionState", ()=>{
      //   console.error("getConnectionState");
      //   emitToSite("connectedProgram", pid);
      // })


    });
  }catch(e){
    console.error("fail connect to socket. check the pid");
    return;
  }

  if(!socket){
    console.error("not found socket");
    process.exit();
  }

  io = await localSocketServerSetup(localSocket=>{

    localSocket.on("toServer", (data, uuid)=>{
      if(uuid){
        emitToServerPromise(data.com, data.data, data.bid);
      }else{
        emitToServer(data.com, data.data, data.bid);
      }
    })

    localSocket.on("toSite", (data, uuid)=>{
      if(uuid){
        emitToSitePromise(data.com, data.data, data.bid);
      }else{
        emitToSite(data.com, data.data, data.bid);
      }
    })
  });

  // pid = await keySetup();

  // if(!pid){
  //   process.exit();
  // }




  pdata = await loadInfo(pid);

  // console.log("program data", pdata);
  // console.log("browsers", pdata.browsers);


  let ps = await proxySetup();
  if(!ps){
    process.exit();
  }





  BrowserManager.listener.onOpened = bid=>{
    // socket.emit("openedBrowser", pid, bid);
    emitToSite("openedBrowser", null, bid);
    logToBrowser(bid, "브라우져 열림.");
  }

  BrowserManager.listener.onClosed = bid=>{
    // socket.emit("closedBrowser", pid, bid);
    emitToSite("closedBrowser", null, bid);
    logToBrowser(bid, "브라우져 닫힘.");
    leaveDataGroup(bid);
  }

  function leaveDataGroup(bid){
    if(socketGroups["gamedata"]){
      if(socketGroups["gamedata"][bid]){
        emitToServer("leaveDataReceiver", null, bid);
      }
      delete socketGroups["gamedata"][bid];
    }
    if(socketGroups["gamedata2"]){
      if(socketGroups["gamedata2"][bid]){
        emitToServer("leaveDataReceiver2", null, bid);
      }
      delete socketGroups["gamedata2"][bid];
    }
  }


  // await Promise.all(pdata.browsers.map(async browserData=>{
  //   await BrowserManager.openBrowser(browserData._id, browserData);
  // }))

  sendBrowserState();

  // await util.delay(2000);
  // browsers.kill();

  // process.on("exit", async ()=>{
  //
  // })

  // process.stdin.resume();
  // process.on("SIGINT", function(){
  //   console.error(333);
  // })
})()
