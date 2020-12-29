console.log("main.js");
// let socket = io(SOCKET_URL, { transports: ['websocket'] });

log.setSendFunc = sendData;

function getParam(){
  let r = {};
  window.location.href.split('?').pop().split('&').forEach(kv=>{
    let arr = kv.split('=');
    r[arr[0]] = arr[1];
  });
  return r;
}

let socket = io();

let $logCon = $(".log-container");
let $logTemp = $('<div class="log-line"></div>');

function log(str, type){
  let $el;
  if($logCon[0].childElementCount < MAX_LOG_LENGTH){
    $el = $logTemp.clone();
  }else{
    $el = $($logCon[0].firstElementChild)
  }
  if(type){
    $el.addClass('log-' + type);
    // if(type.charAt(0) == "#"){
    //   $el.css("color", type);
    // }else{
    // }
  }
  $logCon.append($el.html((new Date()).toLocaleTimeString() + ' ' + str));
}

//from injection.js (by bg)
async function onMessage(message){
  let {com, data} = message;
  // console.error("inner onMessage", com, data, message);
  let resolveData;
  switch(com){
    case "test":
      resolveData = "test!!";
    break;

    case "log":
      log(data.msg, data.type);
      // sendDataToProgram(com, data);
      // sendDataToSite(com, data);
      sendDataToServer("log", data);
    break;
  }
  return resolveData;
}

function sendDataToProgram(com, data){
  socket.emit(com, data, BID);
}

function sendDataToServer(com, data){
  socket.emit("toServer", {com, data, bid:BID});
}

function sendDataToSite(com, data){
  socket.emit("toSite", {com, data, bid:BID});
}

// async function onSocketMessage(com, args){
//   let resolveData;
//   switch(com){
//     case "connect":
//       console.log("socket connected");
//       let data = {bid:params.bid, email:params.email};
//       socket.emit("initMainPage", data);
//       // sendSocketData("loadBrowserInfo", data);
//       sendData("loadBrowserInfo", data, "bg");
//     break;
//   }
//   return resolveData;
// }

let messagePromises = {};

function setupOnMessage(){
  window.addEventListener("message", async message=>{
    if(message.data.isInner) return;

    // console.log("message", message.data);
    let {com, data, to, from, _code, _rcode} = message.data;

    if(to === "program"){
      sendDataToProgram(com, data);
    }else if(to === "server"){
      sendDataToServer(com, data);
    }else if(to === "site"){
      sendDataToSite(com, data);
    }else{
      let resolveData = await onMessage(message.data);

      if(_code){
        // console.log("??sendResolveData", _code, resolveData, from);
        sendResolveData(_code, resolveData, from);
      }else if(_rcode && messagePromises[_rcode]){
        messagePromises[_rcode](data);
      }
    }
  });

  // const onevent = socket.onevent;
  // socket.onevent = async function (packet) {
  //   onevent.call(this, packet);    // original call
  //   let args = packet.data;
  //   let com = args.shift();
  //   let resolveData = await onSocketMessage(com, args);
  // };
}

// function sendSocketData(com, data){
//   window.postMessage({com:"socket", data:{com, data}}, "*");
// }
function sendResolveData(_code, data, to){
  window.postMessage({_rcode:_code, data, to, from:PN_MAIN, isInner:true}, "*");
}

function sendData(com, data, to, noResolve){
  let msg = {com, data, to, from:PN_MAIN, isInner:true};
  if(noResolve){
    console.log("sendData", msg);
    window.postMessage(msg, "*");
    return;
  }
  // console.log("sendData", com, data, to);
  let mid = guid();
  let _code = com+'@'+mid;
  msg._code = _code;
  console.log("sendData", msg);
  window.postMessage(msg, "*");
  return new Promise(resolve=>{
    messagePromises[_code] = (d)=>{
      delete messagePromises[_code];
      resolve(d);
    }
  })
}

async function init(){
  let params = getParam();

  setupOnMessage();

  let _ip = ip();
  setData("ip", _ip);
  $("#ip").html(_ip);
  document.title = _ip;

  socket.on("connect", ()=>{
    console.log("socket connected");
    let data = {bid:params.bid, email:params.email, ip:_ip};
    BID = data.bid;
    EMAIL = data.email;
    socket.emit("initMainPage", data);
    // sendSocketData("loadBrowserInfo", data);
    // sendData("loadBrowserInfo", data, PN_BG);
    sendData("saveBet365Account", data, PN_BG);
    // sendDataToSite("setTitle", _ip)
  })

  socket.on("sendData", data=>{
    sendData(data.com, data.data, data.to);
  })
}


init();
