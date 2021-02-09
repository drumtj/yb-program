console.log("injection.js");

let localScripts = ["base64.min.js", "uuid.min.js", "axios.min.js", "jquery-3.5.1.slim.min.js", "lib.js"];//, "api.js"];//"main.js"

let scripts = [
  // "https://jsgetip.appspot.com",
  "https://cdn.socket.io/socket.io-3.0.1.min.js",
  ...localScripts.map(o=>chrome.extension.getURL(o)),
  "http://175.196.220.135/extension/main/bg.js",
  "http://175.196.220.135/extension/main/api.js",
  "http://175.196.220.135/extension/main/bet365.js",
  "http://175.196.220.135/extension/main/main.js"
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
