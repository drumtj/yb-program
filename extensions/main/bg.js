
console.error("bg.js loaded");


let api, papi, setting;
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

function setBet365Url(countryCode){
	if(countryCode == "DE"){
		tabInfos.bet365.url = "https://www.bet365.de";
	}
}

let pinnacleSportsMap = {"id":1,"name":"Badminton","hasOfferings":false,"leagueSpecialsCount":0,"eventSpecialsCount":0,"eventCount":0,"Bandy":{"id":2,"name":"Bandy","hasOfferings":false,"leagueSpecialsCount":0,"eventSpecialsCount":0,"eventCount":0},"Baseball":{"id":3,"name":"Baseball","hasOfferings":true,"leagueSpecialsCount":3,"eventSpecialsCount":0,"eventCount":0},"Basketball":{"id":4,"name":"Basketball","hasOfferings":true,"leagueSpecialsCount":0,"eventSpecialsCount":345,"eventCount":80},"Beach Volleyball":{"id":5,"name":"Beach Volleyball","hasOfferings":false,"leagueSpecialsCount":0,"eventSpecialsCount":0,"eventCount":0},"Boxing":{"id":6,"name":"Boxing","hasOfferings":true,"leagueSpecialsCount":0,"eventSpecialsCount":0,"eventCount":9},"Chess":{"id":7,"name":"Chess","hasOfferings":false,"leagueSpecialsCount":0,"eventSpecialsCount":0,"eventCount":0},"Cricket":{"id":8,"name":"Cricket","hasOfferings":true,"leagueSpecialsCount":0,"eventSpecialsCount":0,"eventCount":4},"Curling":{"id":9,"name":"Curling","hasOfferings":false,"leagueSpecialsCount":0,"eventSpecialsCount":0,"eventCount":0},"Darts":{"id":10,"name":"Darts","hasOfferings":false,"leagueSpecialsCount":0,"eventSpecialsCount":0,"eventCount":0},"Darts (Legs)":{"id":11,"name":"Darts (Legs)","hasOfferings":false,"leagueSpecialsCount":0,"eventSpecialsCount":0,"eventCount":0},"E Sports":{"id":12,"name":"E Sports","hasOfferings":true,"leagueSpecialsCount":18,"eventSpecialsCount":1404,"eventCount":112},"Field Hockey":{"id":13,"name":"Field Hockey","hasOfferings":false,"leagueSpecialsCount":0,"eventSpecialsCount":0,"eventCount":0},"Floorball":{"id":14,"name":"Floorball","hasOfferings":false,"leagueSpecialsCount":0,"eventSpecialsCount":0,"eventCount":0},"Football":{"id":15,"name":"Football","hasOfferings":true,"leagueSpecialsCount":1,"eventSpecialsCount":265,"eventCount":10},"Futsal":{"id":16,"name":"Futsal","hasOfferings":false,"leagueSpecialsCount":0,"eventSpecialsCount":0,"eventCount":0},"Golf":{"id":17,"name":"Golf","hasOfferings":true,"leagueSpecialsCount":1,"eventSpecialsCount":0,"eventCount":22},"Handball":{"id":18,"name":"Handball","hasOfferings":true,"leagueSpecialsCount":1,"eventSpecialsCount":0,"eventCount":7},"Hockey":{"id":19,"name":"Hockey","hasOfferings":true,"leagueSpecialsCount":5,"eventSpecialsCount":0,"eventCount":48},"Horse Racing":{"id":20,"name":"Horse Racing","hasOfferings":false,"leagueSpecialsCount":0,"eventSpecialsCount":0,"eventCount":0},"Mixed Martial Arts":{"id":22,"name":"Mixed Martial Arts","hasOfferings":true,"leagueSpecialsCount":0,"eventSpecialsCount":0,"eventCount":34},"Other Sports":{"id":23,"name":"Other Sports","hasOfferings":false,"leagueSpecialsCount":0,"eventSpecialsCount":0,"eventCount":0},"Politics":{"id":24,"name":"Politics","hasOfferings":false,"leagueSpecialsCount":0,"eventSpecialsCount":0,"eventCount":0},"Rugby League":{"id":26,"name":"Rugby League","hasOfferings":false,"leagueSpecialsCount":0,"eventSpecialsCount":0,"eventCount":0},"Rugby Union":{"id":27,"name":"Rugby Union","hasOfferings":true,"leagueSpecialsCount":1,"eventSpecialsCount":0,"eventCount":1},"Snooker":{"id":28,"name":"Snooker","hasOfferings":true,"leagueSpecialsCount":0,"eventSpecialsCount":0,"eventCount":7},"Soccer":{"id":29,"name":"Soccer","hasOfferings":true,"leagueSpecialsCount":8,"eventSpecialsCount":3499,"eventCount":449},"Softball":{"id":30,"name":"Softball","hasOfferings":false,"leagueSpecialsCount":0,"eventSpecialsCount":0,"eventCount":0},"Squash":{"id":31,"name":"Squash","hasOfferings":false,"leagueSpecialsCount":0,"eventSpecialsCount":0,"eventCount":0},"Table Tennis":{"id":32,"name":"Table Tennis","hasOfferings":false,"leagueSpecialsCount":0,"eventSpecialsCount":0,"eventCount":0},"Tennis":{"id":33,"name":"Tennis","hasOfferings":true,"leagueSpecialsCount":10,"eventSpecialsCount":0,"eventCount":141},"Volleyball":{"id":34,"name":"Volleyball","hasOfferings":true,"leagueSpecialsCount":0,"eventSpecialsCount":0,"eventCount":9},"Volleyball (Points)":{"id":35,"name":"Volleyball (Points)","hasOfferings":false,"leagueSpecialsCount":0,"eventSpecialsCount":0,"eventCount":0},"Water Polo":{"id":36,"name":"Water Polo","hasOfferings":false,"leagueSpecialsCount":0,"eventSpecialsCount":0,"eventCount":0},"Aussie Rules":{"id":39,"name":"Aussie Rules","hasOfferings":false,"leagueSpecialsCount":0,"eventSpecialsCount":0,"eventCount":0},"Alpine Skiing":{"id":40,"name":"Alpine Skiing","hasOfferings":false,"leagueSpecialsCount":0,"eventSpecialsCount":0,"eventCount":0},"Biathlon":{"id":41,"name":"Biathlon","hasOfferings":false,"leagueSpecialsCount":0,"eventSpecialsCount":0,"eventCount":0},"Ski Jumping":{"id":42,"name":"Ski Jumping","hasOfferings":true,"leagueSpecialsCount":0,"eventSpecialsCount":0,"eventCount":1},"Cross Country":{"id":43,"name":"Cross Country","hasOfferings":false,"leagueSpecialsCount":0,"eventSpecialsCount":0,"eventCount":0},"Formula 1":{"id":44,"name":"Formula 1","hasOfferings":false,"leagueSpecialsCount":0,"eventSpecialsCount":0,"eventCount":0},"Cycling":{"id":45,"name":"Cycling","hasOfferings":false,"leagueSpecialsCount":0,"eventSpecialsCount":0,"eventCount":0},"Bobsleigh":{"id":46,"name":"Bobsleigh","hasOfferings":false,"leagueSpecialsCount":0,"eventSpecialsCount":0,"eventCount":0},"Figure Skating":{"id":47,"name":"Figure Skating","hasOfferings":false,"leagueSpecialsCount":0,"eventSpecialsCount":0,"eventCount":0},"Freestyle Skiing":{"id":48,"name":"Freestyle Skiing","hasOfferings":false,"leagueSpecialsCount":0,"eventSpecialsCount":0,"eventCount":0},"Luge":{"id":49,"name":"Luge","hasOfferings":false,"leagueSpecialsCount":0,"eventSpecialsCount":0,"eventCount":0},"Nordic Combined":{"id":50,"name":"Nordic Combined","hasOfferings":false,"leagueSpecialsCount":0,"eventSpecialsCount":0,"eventCount":0},"Short Track":{"id":51,"name":"Short Track","hasOfferings":false,"leagueSpecialsCount":0,"eventSpecialsCount":0,"eventCount":0},"Skeleton":{"id":52,"name":"Skeleton","hasOfferings":false,"leagueSpecialsCount":0,"eventSpecialsCount":0,"eventCount":0},"Snow Boarding":{"id":53,"name":"Snow Boarding","hasOfferings":false,"leagueSpecialsCount":0,"eventSpecialsCount":0,"eventCount":0},"Speed Skating":{"id":54,"name":"Speed Skating","hasOfferings":false,"leagueSpecialsCount":0,"eventSpecialsCount":0,"eventCount":0},"Olympics":{"id":55,"name":"Olympics","hasOfferings":false,"leagueSpecialsCount":0,"eventSpecialsCount":0,"eventCount":0},"Athletics":{"id":56,"name":"Athletics","hasOfferings":false,"leagueSpecialsCount":0,"eventSpecialsCount":0,"eventCount":0},"Crossfit":{"id":57,"name":"Crossfit","hasOfferings":false,"leagueSpecialsCount":0,"eventSpecialsCount":0,"eventCount":0},"Entertainment":{"id":58,"name":"Entertainment","hasOfferings":true,"leagueSpecialsCount":3,"eventSpecialsCount":0,"eventCount":0},"Drone Racing":{"id":60,"name":"Drone Racing","hasOfferings":false,"leagueSpecialsCount":0,"eventSpecialsCount":0,"eventCount":0},"Poker":{"id":62,"name":"Poker","hasOfferings":false,"leagueSpecialsCount":0,"eventSpecialsCount":0,"eventCount":0},"Motorsport":{"id":63,"name":"Motorsport","hasOfferings":false,"leagueSpecialsCount":0,"eventSpecialsCount":0,"eventCount":0},"Simulated Games":{"id":64,"name":"Simulated Games","hasOfferings":false,"leagueSpecialsCount":0,"eventSpecialsCount":0,"eventCount":0},"Sumo":{"id":65,"name":"Sumo","hasOfferings":false,"leagueSpecialsCount":0,"eventSpecialsCount":0,"eventCount":0}};

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

function sendDataToMain(com, data){
	sendData(com, data, PN_MAIN);
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

function activeBet365(){
  chrome.tabs.update(tabInfos.bet365.id, {active:true});
}

function activeMain(){
  chrome.tabs.update(tabInfos.main.id, {active:true});
}

async function onBgMessage(message){
	if(message.com){
		console.log("onBgMessage", message);
	}
	let {com, data, from} = message;
	let resolveData;
	switch(com){
		case "activeBet365":
			activeBet365();
		break;

		case "activeMain":
			activeMain();
		break;

		case "saveBet365Account":
			console.log(data);
			EMAIL = data.email;
			BID = data.bid;
			setData("ip", data.ip);

			api = setupAPI(API_BASEURL, EMAIL);
			if(data.needPnc){
				let res = await api.getPncinfo(EMAIL);
				// console.error("@@@@", res);
				if(res.status == "success"){
					setting = res.data;
					setData("pinnacleId", setting.pinnacleId);
					// console.error({setting});
					papi = new PAPI(setting.pinnacleId, setting.pinnaclePw);
				}else{
					alert("papi가 준비되지 못했습니다.");
					return;
				}
			}
			localStorage.removeItem('browser');


			await createTabs();
			await delay(1000);
		break;

		case "getLine":
			if(!pinnacleSportsMap[data.sports]){
				console.error("can not find sports object in pinnacleSportsMap", data.sports);
				break;
			}

			let sportId = pinnacleSportsMap[data.sports].id;

			let eventId = data.eventId;
			if(data.isLive && data.sports == "Soccer"){
				console.error("라이브 축구 이벤트ID 다시찾기", data.eventId);
				try{
					// 이벤트 id 찾기
					let teamName = data[data.homeAway];
					let events = (await papi.getEvents({sportId:sportId, isLive:1})).league;
					for(let o=0; o<events.length; o++){
				    let event = events[o].events.find(e=>e[data.homeAway] == teamName);
				    if(event){
							eventId = event.id;
			        console.error("결과", event.id, event);
			        break;
			    	}
					}
				}catch(e){
					console.error(e);
				}
			}

			let line = await papi.scGetLine({
				eventId: eventId,
				sportId: sportId,
				isLive: data.isLive,
				betType: data.betType,
				team: data.team,
				side: data.side,
				periodNumber: data.periodNumber,
				handicap: data.handicap
			})

			resolveData = line;
		break;

		case "placeBet":
			resolveData = await papi.scMinPlaceBet(data);
		break;

		case "getBets":
			resolveData = await papi.getBets({uniqueRequestIds:data});
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
					sendDataToSite("receiveIP", getData("ip"));

					let res = await api.loadBrowser(BID);
					console.log("load browser info", res);
					if(res.status == "success"){
						browser = res.data;
						localStorage.setItem('browser', browser);

						let account = browser.account;
						// setProxy(setting['proxyZone-'+account.country], setting['proxyPw-'+account.country]);
						// test
						// account = {
						// 	id: "banu8995",
						// 	pw: "Asas1234@"
						// };
						console.log('login', account);
						log('bet365 로그인 중.');
						activeBet365();
						let money = await sendData("login", account, PN_B365);
						activeMain();
						if(money == null){
							log('로그인 실패');
						}else{
							log(`bet365 (${account.id}) 로그인 완료. 잔액: ${money}`);
							sendDataToServer("updateMoney", money);
							sendDataToMain("bet365LoginComplete",{
								account,
								pinnacleId:getData("pinnacleId"),
								betOption:browser.option.data
							});
							// sendDataToServer("bet365InitData", {
							// 	money,
							// 	limited
							// })
						}
					}else{
						alert(res.message);
					}
				}
			}catch(e){
				console.error(e);
			}
		break;

		case "getIP":
			sendDataToSite("receiveIP", getData("ip"));
			// sendData("receiveIP", getData("ip"), 'site');
		break;

		case "getState":
			sendDataToSite("receiveState", {
				ip: getData("ip"),
				isMatching: await sendData("isMatching", null, PN_MAIN)
			});
			// sendData("receiveIP", getData("ip"), 'site');
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
	}, {"urls": ["https://*.bet365.com/*", "https://*.bet365.de/*"], "types": ["image", "sub_frame"]}, ["blocking"]);
}

// function setProxy(zone, pw){
// 	console.error("setProxy", zone, pw);
// 	localStorage["proxy_login"] = zone;
// 	localStorage["proxy_password"] = pw;
// }
//
// function setupAuthProxy(){
// 	let calls = {};
// 	var NOTIFICATION_ID = 'proxyautoauthnotification';
// 	var DEFAULT_RETRY_ATTEMPTS = 5;
// 	// localStorage["proxy_login"] = zone;
// 	// localStorage["proxy_password"] = pw;
//
// 	function isLocked(){
// 		return typeof localStorage["proxy_locked"] === 'string' && localStorage["proxy_locked"] === 'true';
// 	}
// 	function lock(){
// 		localStorage["proxy_locked"] = true;
// 	}
// 	function unlock(){
// 		localStorage["proxy_locked"] = false;
// 	}
// 	chrome.webRequest.onAuthRequired.addListener(
// 		async function(details) {
//
// 			var locked = isLocked();
// 			var idstr = details.requestId.toString();
//
// 			if(details.isProxy === true && !locked){
//
// 				console.log('AUTH - ' + details.requestId);
//
// 				console.error({
// 					login: localStorage["proxy_login"],
// 					pw: localStorage["proxy_password"]
// 				});
// 				//console.log(JSON.stringify(details));
//
// 				if(!(idstr in calls)){
// 					calls[idstr] = 0;
// 				}
// 				calls[idstr] = calls[idstr] + 1;
//
// 				var retry = DEFAULT_RETRY_ATTEMPTS;
//
// 				if(calls[idstr] >= retry){
// 					lock();
// 					chrome.notifications.create(NOTIFICATION_ID, {
// 						'type': 'basic',
// 						//'iconUrl': 'icon_locked_128.png',
// 						'title': 'Proxy Auto Auth error',
// 						'message': 'A lot of Proxy Authentication requests have been detected. There is probably a mistake in your credentials. For your safety, the extension has been temporary locked. To unlock it, click the save button in the options.',
// 						'isClickable': true,
// 						'priority': 2
// 					}, function(id){
// 						//console.log('notification callback');
// 					});
// 					calls = {};
// 					return({
// 						cancel : true
// 					});
// 				}
//
// 				var login = localStorage["proxy_login"];
// 				var password = localStorage["proxy_password"];
//
// 				if (login && password && !locked){
// 					console.error("return auth!");
// 					return({
// 						authCredentials : {
// 							'username' : login,
// 							'password' : password
// 						}
// 					});
// 				}
// 			}
// 		},
// 		{urls: ["<all_urls>"]},
// 		["blocking"]
// 	);
// }

let urlParams;

function getMainTab(){
	return new Promise(resolve=>{
		chrome.tabs.query({
			url: HOST_URL + "/main.html*"
		},tabs=>{
			console.error(tabs);
			if(tabs[0]){
				tabInfos["main"].id = tabs[0].id;
				urlParams = getUrlParams(tabs[0].url);
				setBet365Url(urlParams.countryCode);
				// console.error(params);
				// let proxy = params.proxy.split(':');
				// setProxy(proxy[0], proxy[1]);
				// chrome.tabs.update(tabs[0].id, {"active":true,"highlighted":true});
		    // sendToBg("socket", message.data);
				resolve(tabs[0]);
			}else{
				resolve(null);
			}
		})
	})
}

function injectionScript(){
	chrome.tabs.executeScript(tabInfos["main"].id, {
		file: "injection.js"
	});
}


// function setupModifyRequestHeader(){
// 	chrome.webRequest.onBeforeSendHeaders.addListener(
// 	  function(details) {
// 			// console.error(details);
// 			// if(details.initiator.indexOf("bet365.com") > -1){
// 				for (var i = 0; i < details.requestHeaders.length; i++) {
// 		      if (details.requestHeaders[i].name === 'sec-ch-ua' || details.requestHeaders[i].name === 'sec-ch-ua-mobile') {
// 		        details.requestHeaders.splice(i, 1);
// 						i--;
// 		      }
// 		    }
// 				// console.error("@@", details.requestHeaders);
// 				return { requestHeaders: details.requestHeaders };
// 			// }
// 			// return;
// 	  },
// 	  {urls: [
// 			"https://*.bet365.com/*", "https://*.bet365.de/*", "https://*.nj.bet365.com/*"
// 			//'<all_urls>'
// 		]},
// 	  ['blocking', 'requestHeaders' /* , 'extraHeaders' */]
// 	  // uncomment 'extraHeaders' above in case of special headers since Chrome 72
// 	  // see https://developer.chrome.com/extensions/webRequest#life_cycle_footnote
// 	);
// }

async function init(){
	setupOnMessage();
	// setupAuthProxy();
	// setupModifyRequestHeader();
	setupImageBlock();
	await getMainTab();
	injectionScript();
}

init();
