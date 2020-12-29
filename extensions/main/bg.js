
console.error("bg.js loaded");


let api;
let debug = true;

let tabInfos = {
	main: {
		url: HOST_URL + "/main.html",
		id: undefined
	},
	bet365: {
		url: "https://www.bet365.com",
		id: undefined
	},
	extension: {
		url: "chrome://extensions/",
		id: undefined
	}
}

async function createTabs(){
	for(let site in tabInfos){
		if(tabInfos[site].id !== undefined) continue;

		await new Promise(resolve=>{
			chrome.tabs.create({url:tabInfos[site].url}, tab=>{
				tabInfos[site].id = tab.id;
				resolve();
			})
		})
	}
}


let messagePromises = {};
function setupOnMessage(){
	chrome.runtime.onMessage.addListener(async (message,sender,senderResponse)=>{
		// console.log("message", message);
		// let {com, data, to} = message;
		if(message.to == PN_BG){
			let {com, data, to, from, _code, _rcode} = message;
		  let resolveData = await onBgMessage(message);
			if(_code){
		    sendResolveData(_code, resolveData, from);
		  }else if(_rcode && messagePromises[_rcode]){
		    messagePromises[_rcode](data);
		  }
		}else if(message.to){
			_sendData(message);
		}
  });
}

function sendData(com, data, to, noResolve){
	let msg = {com, data, to, from:PN_BG};
  if(noResolve){
    console.log("sendData", msg);
    _sendData(msg);
    return;
  }
  let mid = guid();
  let _code = com+'@'+mid;
  // chrome.runtime.sendMessage({com, data, to, from:PN_BG, _code});
	msg._code = _code;
	console.log("sendData", msg);
	_sendData(msg);
  return new Promise(resolve=>{
    messagePromises[_code] = (d)=>{
			// console.error("resolve", d);
      delete messagePromises[_code];
      resolve(d);
    }
  })
}

function sendResolveData(_code, data, to){
	_sendData({_rcode:_code, data, to, from:PN_BG});
}

let containMainExp = /(program|server|site)/;
function _sendData(message){
	let _to = message.to;
	//if(_to === "program"){
	if(containMainExp.test(_to)){
		_to = PN_MAIN;
	}

	if(tabInfos[_to]){
		// console.log("_sendData", _to, message);
		chrome.tabs.sendMessage(tabInfos[_to].id, message);
	}else{
		console.error(to + "는 tabInfos에 없습니다.")
	}
}

function sendDataToProgram(com, data){
	sendData(com, data, "program");
}

function sendDataToServer(com, data){
  sendData(com, data, "server");
}

function sendDataToSite(com, data){
  sendData(com, data, "site");
}


async function onBgMessage(message){
	if(message.com){
		console.log("onBgMessage", message);
	}
	let {com, data, from} = message;
	let resolveData;
	switch(com){
		case "saveBet365Account":
			console.log(data);
			EMAIL = data.email;
			BID = data.bid;
			setData("ip", data.ip);

			api = setupAPI(API_BASEURL, EMAIL);


			localStorage.removeItem('browser');


			await createTabs();
			await delay(1000);
		break;

		case "setBet365InitMessage":
			// DATA.setBet365InitMessage = data;
			setData("setBet365InitMessage", data);
		break;

		case "readyBet365":
			// data.bid, data.email
			try{

				if(getData("setBet365InitMessage")){
					let initMessage = getData("setBet365InitMessage");
					_sendData(initMessage);
					removeData("setBet365InitMessage");
					break;
				}

				let browser = localStorage.getItem('browser');
				if(!browser){
					let res = await api.loadBrowser(BID);
					console.log("load browser info", res);
					if(res.status == "success"){
						browser = res.data;
						localStorage.setItem('browser', browser);

						let account = browser.account;

						sendDataToSite("setBrowserTitle", getData("ip"));
						// test
						// account = {
						// 	id: "banu8995",
						// 	pw: "Asas1234@"
						// };
						let money = await sendData("login", account, PN_B365);
						log(`bet365 (${account.id}) 로그인 완료. 잔액: ${money}`);
					}
				}
			}catch(e){
				console.error(e);
			}
		break;

		case "getIP":
			sendData("receiveIP", getData("ip"), 'site');
		break;

		// case "getAccount":
		// 	// 이정보로, 벳삼 로긴
		// 	if(localStorage['browser']){
		// 		let account = localStorage['browser'].account;
		// 		if(0&&!account){
		// 			log.error(`browser(${BID})에 account정보 없음`);
		// 		}else{
		// 			// resolveData = account;
		// 			resolveData = {
		// 				id: "banu8995",
		// 				pw: "Asas1234@"
		// 			};
		//
		// 			// startBet365Login(localStorage['browser'].account);
		// 			// let id = account.id;
		// 			// let pw = account.pw;
		//
		// 			// let id = "banu8995";
		// 			// let pw = "Asas1234@";
		// 			//
		// 			// let money = await sendData("login", {id, pw}, PN_B365);
		// 			//
		// 			// log(`bet365 (${id}) 로그인 완료. 잔액: ${money}`);
		// 		}
		// 	}
		// break;
	}

	return resolveData;
}



// async function socketProcess(msg){
// 	let {com, data} = msg;
// 	switch(com){
//
// 		case "loadBrowserInfo":
// 			// data.bid, data.email
// 			try{
// 				console.log(data);
// 				EMAIL = data.email;
// 				BID = data.bid;
// 				api = setupAPI(API_BASEURL, EMAIL);
//
// 				// let res = await axios(API_BASEURL + "/load_browser", data);
// 				let res = await api.loadBrowser(BID);
// 				console.log("load browser info", res);
// 				if(res.status == "success"){
// 					localStorage['browser'] = res.data;
// 				}
// 			}catch(e){
// 				console.error(e);
// 			}
//
// 			// 이정보로, 벳삼 로긴
// 			if(localStorage['browser']){
// 				if(!localStorage['browser'].account){
// 					console.error(`browser(${BID})에 account정보 없음`);
// 				}else{
// 					startBet365Login(localStorage['browser'].account);
// 				}
// 			}
// 		break;
// 	}
// }


let imageExtTest = /.(png|jpg|gif)$/;
function setupImageBlock(){
	chrome.webRequest.onBeforeRequest.addListener(function (e) {
	  // var ftp = e.url.indexOf("ftp") === 0;
	  var http = e.url.indexOf("http") === 0;
		// console.log(e);
		if(http && imageExtTest.test(e.url)){
			return {
				cancel: true
			}
		}
	  // if (http || ftp) {
	  //   return {"cancel": true};
	  // }
	}, {"urls": ["https://*.bet365.com/*"], "types": ["image", "sub_frame"]}, ["blocking"]);
}

function getMainTab(){
	return new Promise(resolve=>{
		chrome.tabs.query({
			url: HOST_URL + "/main.html*"
		},tabs=>{
			console.error(tabs);
			tabInfos["main"].id = tabs[0].id;
			// chrome.tabs.update(tabs[0].id, {"active":true,"highlighted":true});
	    // sendToBg("socket", message.data);
			resolve(tabs[0]);
		})
	})
}

function injectionScript(){
	chrome.tabs.executeScript(tabInfos["main"].id, {
		file: "injection.js"
	});
}


async function init(){
	setupOnMessage();
	setupImageBlock();
	await getMainTab();
	injectionScript();
}

init();
