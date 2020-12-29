console.log("injection.js");

let scripts = [
  "https://jsgetip.appspot.com",
  chrome.extension.getURL("jquery-3.5.1.slim.min.js"),
  chrome.extension.getURL("lib.js"),
  chrome.extension.getURL("main.js")
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
