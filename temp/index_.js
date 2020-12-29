// const { Worker } = require('worker_threads');
//
// async function createPage(){
//   return new Promise(resolve=>{
//     const worker = new Worker(require.resolve("./worker.js"));
//     worker.once('message', page=>{
//       console.error('receive', page);
//       resolve(page)
//     });
//     worker.postMessage("get");
//   })
// }
//
const prompt = require('prompt');
const Client = require('./client.js');


const config = require('../config.js');
const util = require('../util.js');
const axios = require('axios');

const luminati = require('../luminatiAPI.js');
const api = require('../api.js');
const io = require('socket.io-client');



function delay(time){
  return new Promise(resolve=>setTimeout(resolve, time));
}

async function proxySetup(){
  let balance = await luminati.balance();
  // console.log("balance", balance);
  if(!balance.status == 'fail'){
    return {
      status: false,
      message: "[PROXY] " + balance.message
    }
  }
  if(balance.data.balance <= 0){
    return {
      status: false,
      message: "[PROXY] need more balance"
    }
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

  return {
    status: true
  }
}

function socketSetup(){
  return new Promise(resolve=>{
    let socket = io(config.SOCKET_URL, { transports: ['websocket'] });
    socket.on("connect", ()=>{
      console.log("소켓 연결완료");
      resolve(socket);
    })
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
  let pidCheck = await api.checkPID(pid, config.EMAIL);
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

(async () => {

  let pid = await keySetup();

  if(!pid){
    process.exit();
  }


  let ps = await proxySetup();
  if(!ps.status){
    console.error(ps.message);
    process.exit();
  }

  let socket = await socketSetup();
  if(!socket){
    console.error("socket 연결 실패");
    process.exit();
  }


  let count = 1;
  let roomNum;
  // let url = 'https://ip.pe.kr/';
  // let url = 'http://lumtest.com/myip.json';
  // let url = 'http://educraft.kr/';
  let urls = [
    // "http://lumtest.com/myip.json",
    // "https://www.pinnacle.com/en/",
    "https://www.bet365.com/"
  ]
  let url = urls[0];
  // let url = 'http://luminati.io';
  //

  // prompt.start();
  // let schema = {
  //   properties: {
  //     Count: {
  //       description: '열릴 창 수를 입력하세요(기본값=20) [1 ~ 30]',
  //       default: 20,
  //       required: true
  //     },
  //     Server: {
  //       description: '테스트할 서버 번호를 입력하세요(기본값=0) [0=stage, 1=real]',
  //       default: 0,
  //       required: true
  //     },
  //     RoomNumber: {
  //       description: '방번호를 입력하세요',
  //       pattern: /^[0-9]{6}$/,
  //       message: '6자리 숫자만 입력해주세요',
  //       required: true
  //     }
  //   }
  // };
  // await new Promise(resolve=>{
  //   prompt.get(schema, (err, result)=>{
  //     if(err){
  //       console.log(err);
  //       return;
  //     }
  //
  //     let sn = Math.max(0, Math.min(1, result.Server));
  //     url = urls[sn];
  //     roomNum = result.RoomNumber;
  //     count = Math.max(1, Math.min(30, result.Count));
  //     resolve();
  //   })
  // })


  const clients = [];
  const screen = {
    width: 1920,
    height: 1020
  }
  const browserSize = {
    width: 1200,//500,
    height: 1000,//700
  }

  let culumnSize = 10;
  let rowSize = 3;

  let gapX = Math.min((screen.width-browserSize.width) / Math.min(count, culumnSize), browserSize.width);
  let gapY = Math.min((screen.height-browserSize.height) / (Math.min(Math.ceil(count/culumnSize), rowSize)-1), browserSize.height);
  // console.log(Math.min(Math.ceil(count/culumnSize), rowSize), gapY);
  const taskPs = [];
  for(let i=0; i<count; i++){
    let position;
    let x,y;
    x = Math.floor((i%culumnSize) * gapX);
    y = Math.floor(i/culumnSize) * gapY;
    position = `${x},${y}`;

    // console.log(position);
    let client = new Client({width: browserSize.width, height: browserSize.height, position:position, index:i});
    client.onReceiveData = function(com, data){
      console.log("onReceiveData", com, data);
      switch(com){
        case "sendIP":

        break;
      }
    }

    client.onClickBroadcast = function(data){
      clients.forEach(c=>{
        // console.error(c.option.index, data.id);
        if(c.option.index != data.id){
          c.click(data);
        }
      })
    }

    client.onInputBroadcast = function(data){
      clients.forEach(c=>{
        // console.error(c.option.index, data.id);
        if(c.option.index != data.id){
          c.char(data.value);
        }
      })
    }
    // client.onChangeBroadcast = function(data){
    //   clients.forEach(c=>{
    //     // console.error(c.option.index, data.id);
    //     if(c.option.index != data.id){
    //       c.type(data.selector, data.value);
    //     }
    //   })
    // }
    clients.push(client);
    // await client.goto(url);
    // await client.test({url, roomNum});
    taskPs.push(client.pinnacle({url}));
    // // await delay(300);
    if(taskPs.length == 5 || i == count-1){
      await Promise.all(taskPs);
      taskPs.length = 0;
    }
  }
  // console.error("complete");
  // await new Promise(resolve=>{
    // prompt.get({
    //   properties: {
    //     exit:{
    //       description: '종료하려면 0',
    //       pattern: /^[0]$/,
    //       message: '종료하려면 0',
    //       required: true
    //     }
    //   }
    // }, async (err, result)=>{
    //   if(err){
    //     console.log(err);
    //     return;
    //   }
    //
    //   await Promise.all(clients.map(client=>client.dispose()));
    //   process.exit();
    //   // resolve();
    // })
  // })
})();
