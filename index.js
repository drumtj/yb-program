const prompt = require('prompt');
const axios = require('axios');
const ioClient = require('socket.io-client');
const config = require('./config');
const util = require('./util');
const luminati = require('./luminatiAPI');
const api = require('./api');
const chromeOpen = require('./chrome');
const http = require('http');
const express = require("express");
const BrowserManager = require("./BrowserManager");
// const napi = require("./napi");

let pid, pdata, io, socket;



async function proxySetup(){
  if(!util.USE_PROXY){
    console.log("[PROXY] 프록시 사용안함 설정됨.");
    return true;
  }

  let balance = await luminati.balance();
  // console.log("balance", balance);
  if(!balance.status == 'fail'){
    console.error("[PROXY] " + balance.message);
    return false;
  }

  if(balance.data.balance <= 0){
    console.error("[PROXY] need more balance");
    return false;
  }

  let ips = (await luminati.getIPs()).data[config.PROXY_ZONE];
  // console.log("ips", ips);
  let ip = (await util.getIP()).ip;
  console.log("IP", ip);

  if(ips.indexOf(ip) == -1){
    console.log(`PROXY에 ip(${ip})등록 시작`);
    await luminati.addIP(ip);
    console.log(`PROXY에 ip(${ip})등록 완료`);
  }

  return true;
}

function socketSetup(setupSocketEvent){
  return new Promise(resolve=>{
    let socket = ioClient(config.SOCKET_URL, { transports: ['websocket'] });
    socket.on("connect", async ()=>{
      console.log("소켓 연결완료");
      socket.emit("init", {link:"__program__", pid:(await util.getData("PID")), email:config.EMAIL});
      resolve(socket);
    })
    if(typeof setupSocketEvent === "function" && socket){
      setupSocketEvent(socket);
    }
  })
}

async function keySetup(){
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

  console.log("PID", pid);
  //# pid 검증
  let pidCheck = await api.checkPID(pid);
  if(pidCheck.status == "fail"){
    console.error(pidCheck.message);
    return false;
  }

  if(pid){
    console.log("프로그램 ID 인증 완료");
    await util.setData("PID", pid);
  }else{
    console.log("프로그램 ID 인증 실패");
  }

  return pid;
}

async function loadInfo(pid){
  console.log("프로그램 정보 로드");
  let res = await api.loadProgram(pid);
  if(res.status == 'fail'){
    console.error("프로그램 정보 로드 실패");
    return;
  }

  return res.data;
}

function localSocketServerSetup(setupSocketEvent){
  const app = express();
  const server = http.Server(app);
  const io = require("socket.io")(server);

  // 메인프로그램과 확장프로그램의 통신처리
  io.on('connection', socket=>{
    socket.on("initMainPage", data=>{
      BrowserManager.setSocket(data.bid, socket);
      console.log("브라우져 연결", data.bid);
    })
    setupSocketEvent(socket);
  })

  app.use(express.static("public"));
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






function emitToSite(com, data, bid=undefined){
  if(socket){
    socket.emit("delivery", {com, data, bid});
  }
}

function emitToServer(event, data, bid){
  if(socket){
    socket.emit(event, data, bid);
  }
}

function logToBrowser(bid, msg, type){
  emitToServer("log", {msg, type}, bid);
}

function sendBrowserState(){
  // socket.emit("receiveLivingBrowsers", {pid: pid, bids:BrowserManager.getLivingBrowsers()});
  emitToSite("receiveLivingBrowsers", {pid: pid, bids:BrowserManager.getLivingBrowsers()});
}


(async ()=>{



  io = await localSocketServerSetup(localSocket=>{

    localSocket.on("toServer", data=>{
      emitToServer(data.com, data.data, data.bid);
    })

    localSocket.on("toSite", data=>{
      emitToSite(data.com, data.data, data.bid);
    })
  });

  pid = await keySetup();

  if(!pid){
    process.exit();
  }




  pdata = await loadInfo(pid);

  // console.log("program data", pdata);
  // console.log("browsers", pdata.browsers);


  let ps = await proxySetup();
  if(!ps){
    process.exit();
  }



  // 사이트와 프로그램이 통신하는 부분
  socket = await socketSetup(socket=>{
    socket.on("toMain", data=>{
      BrowserManager.emit(data.bid, data.com, data.data);
    })

    socket.on("toBet365", data=>{
      BrowserManager.sendDataToBet365(data.bid, data.com, data.data);
    })

    socket.on("toBg", data=>{
      BrowserManager.sendDataToBg(data.bid, data.com, data.data);
    })

    socket.on("openBrowser", bid=>{
      BrowserManager.openBrowser(bid);
    })

    socket.on("closeBrowser", bid=>{
      BrowserManager.closeBrowser(bid);
    })

    socket.on("exit", ()=>{
      // BrowserManager.closeBrowserAll();
      process.exit();
    })

    socket.on("getLivingBrowsers", ()=>{
      // console.error("getLivingBrowsers");
      sendBrowserState();
    })


    socket.on("test", ()=>{
      console.log("test");
    })
  });

  if(!socket){
    console.error("socket 연결 실패");
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
