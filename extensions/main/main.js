console.log("main.js");
// let socket = io(SOCKET_URL, { transports: ['websocket'] });

// log.setSendFunc = sendData;


// function getParam(){
//   let r = {};
//   window.location.href.split('?').pop().split('&').forEach(kv=>{
//     let arr = kv.split('=');
//     r[arr[0]] = arr[1];
//   });
//   return r;
// }

let api;
let socket;
let $logCon = $(".log-container");
let $logTemp = $('<div class="log-line"></div>');

function log(msg, type, sendToServer){
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
  $logCon.append($el.html('<span class="text-secondary">'+(new Date()).toLocaleTimeString() + '</span> ' + msg));
  $logCon.scrollTop($logCon.prop('scrollHeight'));
  console.log("[log]", msg);
  if(sendToServer){
    sendDataToServer("log", {msg, type});
  }
}

var flag = {
  bet365LoginComplete:false,
  isMatching:false
};
let betOption;
var account, pinnacleId;
//from injection.js (by bg)
async function onMessage(message){
  let {com, data} = message;
  // console.error("inner onMessage", com, data, message);
  let resolveData;
  switch(com){
    case "test":
      resolveData = "test!!";
    break;

    // case "getBetmax":
    //   delay(500).then(()=>{
    //     var f = `var t = document.querySelector(".bss-StakeBox_StakeValueInput");
    //     function inputWithEvent(el, value){
    //     	var event = new CustomEvent("input");
    //     	el.value = value;
    //     	el.dispatchEvent(event);
    //     };inputWithEvent(t, ${data});`
    //     sendData("dev", f, PN_BG);
    //   })
    // break;

    case "log":
      log(data.msg, data.type, true);
      // sendDataToServer("log", data);
    break;

    case "bet365LoginComplete":
      // console.error("bet365LoginComplete", data);
      account = data.account;
      pinnacleId = data.pinnacleId;
      betOption = data.betOption;
      if(!betOption){
        alert("옵션데이터가 없습니다.")
        return;
      }
      flag.bet365LoginComplete = true;
      if(!flag.isMatching){
        log('매칭을 시작하려면 <span class="text-success">[매칭시작]</span>을 눌러주세요', "warning", true);
      }
    break;

    case "isMatching":
      resolveData = flag.isMatching;
    break;
  }
  return resolveData;
}

function activeBet365(){
  sendData("activeBet365", null, PN_BG, true);
}

function activeMain(){
  sendData("activeMain", null, PN_BG, true);
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

function sendDataToServerPromise(com, data){
  return emitPromise("toServer", {com, data, bid:BID});
}

function sendDataToSitePromise(com, data){
  return emitPromise("toSite", {com, data, bid:BID});
}

function emitPromise(com, data){
  let id = uuid.v4();
  socket.emit(com, data, id);
  return new Promise(resolve=>{
    resolveList[id] = resolve;
  })
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
  if(!to){
    to = PN_BG;
  }
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

async function getBets(betData){
  if(betData.status == "PENDING_ACCEPTANCE"){
    log(`배팅확인중..`, null, true);
    while(1){
      let bd = await sendData("getBets", betData.uniqueRequestId, PN_BG);
      console.error(bd);
      if(bd.straightBets && bd.straightBets.length){
        if(bd.straightBets[0].betStatus == "PENDING_ACCEPTANCE"){
          await delay(1000);
          continue;
        }
        // betData
        // return bd.straightBets[0];
        betData.straightBet = bd.straightBets[0];
        betData.status = "ACCEPTED";
        break;
      }
    }
  }
  // return betData;
}

async function placeBet(line){
  if(line.lineData.status == "SUCCESS"){
    console.error("wait bets");
    log(`피나클 배팅시작: $${line.lineData.minRiskStake}`, "info", true);
    let bets = await sendData("placeBet", line, PN_BG);
    console.error({bets});
    await getBets(bets.betData);
    line.betData = bets.betData;
    if(bets.betData){
      if(bets.betData.status == "ACCEPTED"){
        switch(bets.betData.straightBet.betStatus){
          case "CANCELLED":
            log(`피나클 배팅실패. 취소됨. ${bets.betData.straightBet.betStatus}`, "danger", true);
          break;

          case "REFUNDED":
            log(`피나클 배팅실패. 환불됨. ${bets.betData.straightBet.betStatus}`, "danger", true);
          break;

          case "NOT_ACCEPTED":
            log(`피나클 배팅실패. 허용되지 않음. ${bets.betData.straightBet.betStatus}`, "danger", true);
          break;

          case "ACCEPTED":
            console.error("피나클 배팅성공", bets.betData.straightBet);
            log(`피나클 배팅성공. odds: ${bets.betData.straightBet.price}`, "success", true);
          break;

          default:
            console.error("예상치 못한 배팅 상태", bets.betData.straightBet);
            log(`예상치 못한 배팅 상태 ${bets.betData.straightBet}`, "danger", true);
        }

        // sendDataToServer("betData", {pinnacleId, account:account._id, data:bets.betData.straightBet});
        return {
          status: bets.betData.straightBet.betStatus == "ACCEPTED" ? "success" : "fail",
          data: bets.betData.straightBet
        };
      }else if(bets.betData.status == "PROCESSED_WITH_ERROR"){
        // log(`피나클 배팅실패: ${bets.betData.errorCode} ${bets.betData.errorMessage}`, "danger", true);
        log(`피나클 배팅실패: ${bets.betData.errorCode}`, "danger", true);
      }else{
        console.error("???");
      }
    }
  }
  return {
    status: "fail"
  }
}

function round(n,p=0){
  return Math.round(n * Math.pow(10,p))/Math.pow(10,p);
}

function printPercent(n){
  return round(n*100,2) + '%';
}

function validProfitP(oddsA, oddsB, noLog){
  let profitP = calc.profitP(oddsA, oddsB, 1);
  if(profitP >= betOption.profitP/100){
    if(!noLog){
      log(`수익률: ${printPercent(profitP)}`, "info", true);
    }
    return true;
  }else{
    if(!noLog){
      log(`수익률 ${printPercent(betOption.profitP/100)} 미만(${printPercent(profitP)})`, "danger", true);
    }
    return false;
  }
}

function validProfit(oddsA, oddsB, stakeA, noLog){
  let profit = calc.profit(oddsA, oddsB, stakeA);
  if(profit >= betOption.profit){
    if(!noLog){
      log(`수익: $${round(profit,2)}`, "info", true);
    }
    return true;
  }else{
    if(!noLog){
      log(`수익 $${round(betOption.profit,2)} 미만($${round(profit,2)})`, "danger", true);
    }
    return false;
  }
}

function getEventMark(id){
  let em = getData(id);
  if(!em){
    em = {
      lineFindFailCount: 0
      // profitMatchFailCount: 0
    };
    setData(id, em);
  }
  return em;
}

function benEvent(id, time, msg){
  if(time <= 0){
    log(`이벤트 영구제외: ${msg?msg:''}`, "warning", true);
  }else{
    log(`이벤트 ${time/1000}초 제외: ${msg?msg:''}`, "warning", true);
    setTimeout(()=>{
      clearBenEvent(id);
    },time);
  }
  getEventMark(id).ben = true;
}

function clearBenEvent(id){
  getEventMark(id).ben = false;
}

function isBenEvent(id){
  return !!getEventMark(id).ben;
}

function lineFindFailCount(id){
  return getEventMark(id).lineFindFailCount;
}

function lineFindFailCountUp(id){
  return ++getEventMark(id).lineFindFailCount;
}

// function profitMatchFailCountUp(id){
//   return ++getEventMark(id).profitMatchFailCount;
// }

var isCheckingMatch = false;
async function findMatch(){
  if(isCheckingMatch){
    return;
  }
  let data = getNextData();
  // && data.pinnacle.sports == "Soccer"
  if(data){
    isCheckingMatch = true;
    if(betOption.action == "checkBetmax"){
      await checkBetmaxProcess(data);
    }else if(betOption.action == "vl"){
      // 고정 betmax로 벨류
      await vlProcess(data);
    }else{
      console.error("준비되지 않은 처리:", betOption.action);
    }
    isCheckingMatch = false;
    // log('이벤트 수신 대기중', "primary", true);
  }
}

async function findMatch2(data){
  console.error("findMatch2", {isCheckingMatch});
  if(isCheckingMatch){
    return;
  }
  // let data = getNextData();
  // && data.pinnacle.sports == "Soccer"
  if(data){
    isCheckingMatch = true;
    if(betOption.action == "yb"){
      await userYbProcess(data);
    }else if(betOption.action == "vl"){
      //betmax로 벨류
      await userVlProcess(data);
    }else{
      console.error("준비되지 않은 처리:", betOption.action);
    }

    isCheckingMatch = false;
    // log('이벤트 수신 대기중', "primary", true);
  }
}

function getNextData(){
  let d = getData("gamedata");
  let data;
  while(1){
    data = d.shift();
    if(data){
      // #1 타입확인
      // #2 옵션적용 필터링
      if(Array.isArray(data)){
        data = data.reduce((r,v)=>{
          r[v.bookmaker] = v;
          return r;
        }, {})
      }

      if(isBenEvent(data.pinnacle.id)){
        console.log(`제외된 이벤트: ${data.pinnacle.id}`);
        // log(`제외된 이벤트: ${data.pinnacle.id}`, "warning", true);
        continue;
      }else{
        break;
      }
      // return data;
    }else{
      break;
    }
  }

  return data;
}

async function userVlProcess(data){
  // #1 피나클 라인정보 가져와서 배당 및 타입체크
  console.log(data);
  let matchID = data.pinnacle.id;
  //<blockquote>
  //<div><span class="text-primary">이벤트수신</span></div>
  log(`
    <div>종목: ${data.pinnacle.sports} (${data.pinnacle.betType})</div>
    <div>수익률: ${Math.floor(data.pinnacle.profitP*10000)/100}%</div>
    <div><span class="text-warning">피나클</span>: ${data.pinnacle[data.pinnacle.homeAway]} (<span class="text-info">${data.pinnacle.odds}</span>) <span class="text-warning">${data.pinnacle.type.code}</span> ${data.pinnacle.type.set}</div>
    <div><span class="text-success">벳365</span>: ${data.bet365[data.bet365.homeAway]} (<span class="text-info">${data.bet365.odds}</span>) <span class="text-warning">${data.bet365.type.code}</span> ${data.bet365.type.set}</div>
  `, null, true);




  let bet365Info, checkProfit;
  // #2 벳삼열어서 배당 및 타입체크
  let link = data.bet365.betLink;
  // if(urlParams.countryCode == "DE"){
  //   link = link.replace("https://www.bet365.com", "https://www.bet365.de");
  // }
  bet365Info = await sendData("setUrl", link, PN_B365);
  if(!bet365Info){
    log(`벳365 링크열기 실패`, "danger", true);
    return;
  }else{
    log(`벳365 확인`, null, true);
    console.log("bet365 info", bet365Info);
    console.log("betburger info", data.bet365);
    if(bet365Info.money <= 1){
      log(`배팅취소: 벳365 잔액부족`, 'danger', true);
      stopMatch(true);
      return;
    }
  }

  if(data.bet365.odds != bet365Info.odds){
    log(`벳365 배당변동: ${data.bet365.odds} -> ${bet365Info.odds}`, data.bet365.odds < bet365Info.odds ? "info" : "danger", true);
    data.bet365.odds = bet365Info.odds;
  }
  checkProfit = validProfitP(data.pinnacle.odds, data.bet365.odds);

  if(checkProfit){
    log(`벳365 배팅시작 $${data.bet365.stake}`, "info", true);
    let result = await sendData("placeBet", data.bet365.stake, PN_B365);
    console.log("bet365 bet complete", result);
    if(result.status == "success"){
      log(`벳365 배팅완료!`, "success", true);
      await delay(100);
      log(`피나클 배팅시작`, "info", true);
      // 배팅정보 저장
      let res = await api.bet({
        account: account._id,
        event: matchID,
        odds: data.pinnacle.odds,
        stake: data.pinnacle.stake,
        bookmakerOdds: data.bet365.odds,
        bookmakerStake: data.bet365.stake
      })
      console.log("site bet complete", res);
      if(res.status == "success"){
        log(`피나클 배팅완료!`, "success", true);
      }else{
        log(`피나클 배팅실패: ${res.message}`, "danger", true);
      }
    }else{
      log(`벳365 배팅실패: ${result.message}`, "danger", true);
    }
  }else{
    log(`배팅취소`, 'danger', true);
    return;
  }
}

async function userYbProcess(data){
  // #1 피나클 라인정보 가져와서 배당 및 타입체크
  console.log(data);
  let matchID = data.pinnacle.id;
  //<blockquote>
  //<div><span class="text-primary">이벤트수신</span></div>
  log(`
    <div>종목: ${data.pinnacle.sports} (${data.pinnacle.betType})</div>
    <div>수익률: ${Math.floor(data.pinnacle.profitP*10000)/100}%</div>
    <div><span class="text-warning">피나클</span>: ${data.pinnacle[data.pinnacle.homeAway]} (<span class="text-info">${data.pinnacle.odds}</span>) <span class="text-warning">${data.pinnacle.type.code}</span> ${data.pinnacle.type.set}</div>
    <div><span class="text-success">벳365</span>: ${data.bet365[data.bet365.homeAway]} (<span class="text-info">${data.bet365.odds}</span>) <span class="text-warning">${data.bet365.type.code}</span> ${data.bet365.type.set}</div>
  `, null, true);




  let bet365Info, checkProfit;
  // #2 벳삼열어서 배당 및 타입체크
  let link = data.bet365.betLink;
  // if(urlParams.countryCode == "DE"){
  //   link = link.replace("https://www.bet365.com", "https://www.bet365.de");
  // }
  activeBet365();
  bet365Info = await sendData("setUrl", link, PN_B365);
  activeMain();
  if(!bet365Info){
    log(`벳365 링크열기 실패`, "danger", true);
    return;
  }else{
    log(`벳365 확인`, null, true);
    console.log("bet365 info", bet365Info);
    console.log("betburger info", data.bet365);
    if(bet365Info.money < data.bet365.stake){
      log(`배팅취소: 벳365 잔액부족 ($${data.bet365.stake}/$${bet365Info.money})`, 'danger', true);
      stopMatch(true);
      return;
    }
  }

  if(data.bet365.odds != bet365Info.odds){
    log(`벳365 배당변동: ${data.bet365.odds} -> ${bet365Info.odds}`, data.bet365.odds < bet365Info.odds ? "info" : "danger", true);
    data.bet365.odds = bet365Info.odds;
  }
  checkProfit = validProfitP(data.pinnacle.odds, data.bet365.odds);

  if(checkProfit){
    activeBet365();
    // log(`벳365 배팅시작`, "info", true);
    log(`벳365 배팅시작 $${data.bet365.stake}`, "info", true);
    let result = await sendData("placeBet", data.bet365.stake, PN_B365);
    activeMain();
    console.log("bet365 bet complete", result);
    // if(result === undefined){
    //   console.log("벳삼페이지가 새로고침된것같다 다시시도.");
    //   result = await sendData("placeBet", data.bet365.stake, PN_B365);
    // }
    if(result === undefined){
      log("벳365 배팅실패: 응답없음.", "danger", true);
    }else if(result.status == "success"){
      log(`벳365 배팅완료!`, "success", true);
      await delay(100);
      log(`피나클 배팅시작`, "info", true);
      // 배팅정보 저장
      let res = await api.bet({
        account: account._id,
        event: matchID,
        odds: data.pinnacle.odds,
        stake: data.pinnacle.stake,
        bookmakerOdds: data.bet365.odds,
        bookmakerStake: data.bet365.stake
      })
      if(res.status == "success"){
        log(`피나클 배팅완료!`, "success", true);
      }else{
        log(`피나클 배팅실패: ${res.message}`, "danger", true);
      }
    }else{
      log(`벳365 배팅실패: ${result.message}`, "danger", true);
    }
  }else{
    log(`배팅취소`, 'danger', true);
    return;
  }
}

async function checkBetmaxProcess(data){
  // #1 피나클 라인정보 가져와서 배당 및 타입체크
  console.log(data);
  let matchID = data.pinnacle.id;
  //<blockquote>
  //<div><span class="text-primary">이벤트수신</span></div>
  log(`
    <div>종목: ${data.pinnacle.sports} (${data.pinnacle.betType})</div>
    <div>수익률: ${Math.floor(data.pinnacle.profitP*10000)/100}%</div>
    <div><span class="text-warning">피나클</span>: ${data.pinnacle[data.pinnacle.homeAway]} (<span class="text-info">${data.pinnacle.odds}</span>) <span class="text-warning">${data.pinnacle.type.code}</span> ${data.pinnacle.type.set}</div>
    <div><span class="text-success">벳365</span>: ${data.bet365[data.bet365.homeAway]} (<span class="text-info">${data.bet365.odds}</span>) <span class="text-warning">${data.bet365.type.code}</span> ${data.bet365.type.set}</div>
  `, null, true);

  // console.error("setting", setting);
  console.error("wait getLine");
  let line = await sendData("getLine", data.pinnacle, PN_BG);
  let checkLine;
  console.error({line});
  if(line && line.lineData){
    if(line.lineData.status == "SUCCESS"){
      checkLine = true;
      log(`라인확인`, null, true);
      if(data.pinnacle.odds != line.lineData.price){
        log(`피나클 배당변동: ${data.pinnacle.odds} -> ${line.lineData.price}`, data.pinnacle.odds < line.lineData.price ? "info" : "danger", true);
        data.pinnacle.odds = line.lineData.price;
      }
    }else{
      console.error(line.lineData.status);
      log(`라인찾기실패: ${line.lineData.status}`, "danger", true);

      let count = lineFindFailCountUp(matchID);
      if(count >= 2){
        benEvent(matchID, 0, "2 연속 못찾음");
      }
    }
  }else{
    log(`이벤트로드 실패`, "danger", true);
  }



  let bet365Info, checkProfit;
  // #2 벳삼열어서 배당 및 타입체크
  if(checkLine){
    let link = data.bet365.betLink;
    // if(urlParams.countryCode == "DE"){
    //   link = link.replace("https://www.bet365.com", "https://www.bet365.de");
    // }
    activeBet365();
    bet365Info = await sendData("setUrl", link, PN_B365);
    activeMain();
    if(!bet365Info){
      log(`벳365 링크열기 실패`, "danger", true);
      return;
    }else{
      log(`벳365 확인`, null, true);
      console.log("bet365 info", bet365Info);
      console.log("betburger info", data.bet365);
      if(bet365Info.money <= 1){
        log(`배팅취소: 벳365 잔액부족`, 'danger', true);
        stopMatch(true);
        return;
      }
    }

    //옵션의 수익률로 판단하도록 수정하자
    if(data.bet365.odds != bet365Info.odds){
      log(`벳365 배당변동: ${data.bet365.odds} -> ${bet365Info.odds}`, data.bet365.odds < bet365Info.odds ? "info" : "danger", true);
      data.bet365.odds = bet365Info.odds;
    }
    checkProfit = validProfitP(data.pinnacle.odds, data.bet365.odds);

    if(!checkProfit){
      benEvent(matchID, 10000);
      log(`배팅취소`, 'danger', true);
      return;
    }
  }



  let checkPinnacleBet;
  // #3 피나클 배팅.
  if(checkProfit){
    let betResult = await placeBet(line);
    if(betResult.status == "success"){
      // 피나클 배팅완료후, 배팅된 배당으로 다시 수익률을 판단할 필요가 있나 ?
      // checkProfit = validProfitP(betResult.data.price, bet365Info.odds);
      if(betResult.data.price != data.pinnacle.odds){
        log(`피나클배팅후 배당바뀜: ${data.pinnacle.odds} -> ${betResult.data.price}`, data.pinnacle.odds < betResult.data.price ? "info" : "danger", true);
        data.pinnacle.odds = betResult.data.price;
        checkProfit = validProfitP(data.bet365.odds, data.pinnacle.odds, true) || validProfit(data.bet365.odds, data.pinnacle.odds, data.bet365.stake, true);
        if(!checkProfit){
          log(`배팅취소`, 'danger', true);
          return;
        }
      }
      checkPinnacleBet = true;
    }else{
      return;
    }
  }

  // #4 벳맥스 체크
  if(checkLine && checkProfit && checkPinnacleBet){
    activeBet365();
    log(`betmax 확인시작`, null, true);
    let betmaxInfo = await sendData("getBetmax", null, PN_B365);
    activeMain();
    console.error({betmaxInfo});
    if(betmaxInfo == null){
      log(`배팅취소: 벳365 이벤트 사라짐`, 'danger', true);
      return;
    }
    if(betmaxInfo.betmax > betOption.maxBetmax){
      log(`betmax 제한값 초과. 절삭: $${betOption.maxBetmax}`, null, true);
      betmaxInfo.betmax = betOption.maxBetmax;
    }
    log(`betmax: $${betmaxInfo.betmax}, odds: ${betmaxInfo.info.odds}`, null, true);
    data.bet365.stake = round(betmaxInfo.betmax, 2);
    if(betmaxInfo.info.odds != data.bet365.odds){
      log(`벳삼배당바뀜: ${data.bet365.odds} -> ${betmaxInfo.info.odds}`, data.bet365.odds < betmaxInfo.info.odds ? "info" : "danger", true);
      data.bet365.odds = betmaxInfo.info.odds;
      checkProfit = validProfitP(data.bet365.odds, data.pinnacle.odds);
    }

    if(checkProfit){
      checkProfit = validProfit(data.bet365.odds, data.pinnacle.odds, data.bet365.stake);
      // log(`수익: $${profit}`, checkProfit ? "info" : "danger", true);
    }

    console.error("##", line);
    if(checkProfit){
      // let profit = calc.profit(data.bet365.odds, data.pinnacle.odds, data.bet365.stake);
      // let profitP = calc.profitP(data.bet365.odds, data.pinnacle.odds, 1);
      var stakePnc = calc.stakeB(data.bet365.odds, data.pinnacle.odds, data.bet365.stake);
      data.pinnacle.stake = round(stakePnc, 2);
      log(`
        <div class="text-info">------ 데이터 전송 ------</div>
        <div class="text-warning">피나클: $${data.pinnacle.stake} (${data.pinnacle.odds})</div>
        <div class="text-success">벳365: $${data.bet365.stake} (${data.bet365.odds})</div>
      `, null, true);
      data.pinnacle.line = line;
      // data.account = account._id;
      // data.pinnacleId = pinnacleId;
      sendDataToServer("inputGameData", data);
    }else{
      log(`배팅취소`, 'danger', true);
    }
  }
}//end checkBetmaxProcess

async function vlProcess(data){
  // #1 피나클 라인정보 가져와서 배당 및 타입체크
  console.log(data);
  let matchID = data.pinnacle.id;
  //<blockquote>
  //<div><span class="text-primary">이벤트수신</span></div>
  log(`
    <div>종목: ${data.pinnacle.sports} (${data.pinnacle.betType})</div>
    <div>수익률: ${Math.floor(data.pinnacle.profitP*10000)/100}%</div>
    <div><span class="text-warning">피나클</span>: ${data.pinnacle[data.pinnacle.homeAway]} (<span class="text-info">${data.pinnacle.odds}</span>) <span class="text-warning">${data.pinnacle.type.code}</span> ${data.pinnacle.type.set}</div>
    <div><span class="text-success">벳365</span>: ${data.bet365[data.bet365.homeAway]} (<span class="text-info">${data.bet365.odds}</span>) <span class="text-warning">${data.bet365.type.code}</span> ${data.bet365.type.set}</div>
  `, null, true);

  // console.error("setting", setting);
  console.error("wait getLine");
  let line = await sendData("getLine", data.pinnacle, PN_BG);
  let checkLine;
  console.error({line});
  if(line && line.lineData){
    if(line.lineData.status == "SUCCESS"){
      checkLine = true;
      log(`라인확인`, null, true);
      if(data.pinnacle.odds != line.lineData.price){
        log(`피나클 배당변동: ${data.pinnacle.odds} -> ${line.lineData.price}`, data.pinnacle.odds < line.lineData.price ? "info" : "danger", true);
        data.pinnacle.odds = line.lineData.price;
      }
    }else{
      console.error(line.lineData.status);
      log(`라인찾기실패: ${line.lineData.status}`, "danger", true);

      let count = lineFindFailCountUp(matchID);
      if(count >= 2){
        benEvent(matchID, 0, "2 연속 못찾음");
      }
    }
  }else{
    log(`이벤트로드 실패`, "danger", true);
  }



  let bet365Info, checkProfit;
  // #2 벳삼열어서 배당 및 타입체크
  if(checkLine){
    let link = data.bet365.betLink;
    // if(urlParams.countryCode == "DE"){
    //   link = link.replace("https://www.bet365.com", "https://www.bet365.de");
    // }
    activeBet365();
    bet365Info = await sendData("setUrl", link, PN_B365);
    activeMain();
    if(!bet365Info){
      log(`벳365 링크열기 실패`, "danger", true);
      return;
    }else{
      log(`벳365 확인`, null, true);
      console.log("bet365 info", bet365Info);
      console.log("betburger info", data.bet365);
      if(bet365Info.money <= 1){
        log(`배팅취소: 벳365 잔액부족`, 'danger', true);
        stopMatch(true);
        return;
      }
    }
    //옵션의 수익률로 판단하도록 수정하자
    if(data.bet365.odds != bet365Info.odds){
      log(`벳365 배당변동: ${data.bet365.odds} -> ${bet365Info.odds}`, data.bet365.odds < bet365Info.odds ? "info" : "danger", true);
      data.bet365.odds = bet365Info.odds;
    }
    checkProfit = validProfitP(data.pinnacle.odds, data.bet365.odds);

    if(!checkProfit){
      benEvent(matchID, 10000);
      log(`배팅취소`, 'danger', true);
      return;
    }
  }



  let checkPinnacleBet;
  // #3 피나클 배팅.
  if(checkProfit){
    let betResult = await placeBet(line);
    if(betResult.status == "success"){
      // 피나클 배팅완료후, 배팅된 배당으로 다시 수익률을 판단할 필요가 있나 ?
      // checkProfit = validProfitP(betResult.data.price, bet365Info.odds);
      if(betResult.data.price != data.pinnacle.odds){
        log(`피나클배팅후 배당바뀜: ${data.pinnacle.odds} -> ${betResult.data.price}`, data.pinnacle.odds < betResult.data.price ? "info" : "danger", true);
        data.pinnacle.odds = betResult.data.price;
        checkProfit = validProfitP(data.bet365.odds, data.pinnacle.odds, true) || validProfit(data.bet365.odds, data.pinnacle.odds, data.bet365.stake, true);
        if(!checkProfit){
          log(`배팅취소`, 'danger', true);
          return;
        }
      }
      checkPinnacleBet = true;
    }else{
      return;
    }
  }

  // #4 벳맥스 체크
  if(checkLine && checkProfit && checkPinnacleBet){
    activeBet365();
    log(`벳365 배팅시작 $${betOption.customBetmax}`, "info", true);
    let result = await sendData("placeBet", betOption.customBetmax, PN_B365);
    activeMain();
    console.log("bet365 bet complete", result);
    // if(result === undefined){
    //   console.log("벳삼페이지가 새로고침된것같다 다시시도.");
    //   result = await sendData("placeBet", betOption.customBetmax, PN_B365);
    // }
    if(result === undefined){
      log("벳365 배팅실패: 응답없음.", "danger", true);
    }else if(result.status == "success"){
      log(`벳365 배팅완료!`, "success", true);
      benEvent(matchID);
    }else{
      log(`벳365 배팅실패: ${result.message}`, "danger", true);
    }
  }
}//end checkBetmaxProcess

function startMatch(sync){
  log("-------- 매칭켜짐 --------", "info", true);
  flag.isMatching = true;
  if(sync){
    sendDataToSite("receiveMatchFlag", flag.isMatching);
  }
}

function stopMatch(sync){
  log("-------- 매칭꺼짐 --------", "danger", true);
  flag.isMatching = false;
  if(sync){
    sendDataToSite("receiveMatchFlag", flag.isMatching);
  }
}

var resolveList = {};
let urlParams;
async function init(){
  // let params = getParam();
  urlParams = getUrlParams(window.location.href);
  history.replaceState({}, "index", "http://localhost:8080/main.html");

  socket = io();
  setupOnMessage();

  let _ip = ip();
  setData("ip", _ip);
  $("#ip").html(_ip);
  document.title = _ip;

  socket.on("resolve", (data, uuid)=>{
    if(resolveList[uuid]){
      resolveList[uuid](data);
      delete resolveList[uuid];
    }
  })

  socket.on("connect", async ()=>{
    console.log("socket connected");
    let data = {
      bid: urlParams.bid,
      email: urlParams.email,
      countryCode: urlParams.countryCode,
      ip: _ip,
      needPnc: urlParams.needPnc
    };
    BID = data.bid;
    EMAIL = data.email;
    ///
    // data.isChecker = true;
    ///
    socket.emit("initMainPage", data);
    // sendSocketData("loadBrowserInfo", data);
    // sendData("loadBrowserInfo", data, PN_BG);
    sendData("saveBet365Account", data, PN_BG, true);
    api = setupAPI(API_BASEURL, EMAIL);
    // sendDataToSite("setTitle", _ip)
  })

  socket.on("sendData", data=>{
    if(data.to == "main"){
      onMessage(data);
    }else{
      sendData(data.com, data.data, data.to, true);
    }
  })

  socket.on("getState", (data, uuid)=>{
    let r = {
      ip: getData("ip"),
      isMatching: flag.isMatching
    }
    socket.emit("resolve", r, uuid);
  })

  socket.on("startMatch", (data, uuid)=>{
    console.log("startMatch", data, uuid);
    startMatch();
    if(uuid){
      socket.emit("resolve", true, uuid);
    }
  })

  socket.on("stopMatch", (data, uuid)=>{
    console.log("stopMatch", data, uuid);
    stopMatch();
    if(uuid){
      socket.emit("resolve", false, uuid);
    }
  })


  // socket.on("setChecker", data=>{
  //
  // })



  socket.on("gamedata", data=>{
    if(!flag.bet365LoginComplete) return;
    if(!flag.isMatching) return;
    console.log("receive gamedata", data);
    // sendData("gamedata", data, "bg");
    let gd;
    try{
      gd = JSON.parse(data.data);
    }catch(e){
      console.error("gamedata parsing error. data:", data);
      return;
    }
    // console.log("gamedata", gd);

    setData("gamedata", gd);
    findMatch();
  })

  socket.on("gamedata2", data=>{
    console.log("receive gamedata2");
    if(!flag.bet365LoginComplete) return;
    if(!flag.isMatching) return;
    // sendData("gamedata", data, "bg");
    // let gd = JSON.parse(data);
    // console.log("gamedata", data);
    //
    setData("gamedata", data);
    findMatch2(data);
  })

}


init();
