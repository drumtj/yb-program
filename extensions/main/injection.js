console.log("injection.js");

let localScripts = ["base64.min.js", "uuid.min.js", "axios.min.js", "jquery-3.5.1.slim.min.js", "lib.js"];//, "api.js"];//"main.js"

let scripts = [
  // "https://jsgetip.appspot.com",
  "https://cdn.socket.io/socket.io-3.0.1.min.js",
  // "http://localhost:8080/socket.io/socket.io.js",
  ...localScripts.map(o=>chrome.extension.getURL(o)),
  HOST_URL + "/extension/main/bg.js",
  HOST_URL + "/extension/main/api.js",
  HOST_URL + "/extension/main/bet365.js",
  HOST_URL + "/extension/main/main.js"
  // chrome.extension.getURL("main.js")
]



init();


function sendToBg(obj){
  // {com, data, to}
  chrome.runtime.sendMessage(obj);
}

function sendToMain(obj){
  // window.postMessage({com, data}, '*');
  window.postMessage(obj, '*');
}

async function init(){
  chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
    // console.log("injection.js message", message);
    // let {com, data, to} = message;
    sendToMain(message);
  })

  window.onmessage = message=>{
    if(!message.data.isInner) return;
    // console.log("injection.js window message", message);
    // let {com, data} = message.data;
    sendToBg(message.data);

    // chrome.runtime.sendMessage({com:"socket", data:message.data});
  }

  for(let i=0; i<scripts.length; i++){
    await addScript(scripts[i]);
  }
}
