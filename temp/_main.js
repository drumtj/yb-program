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
let betOption, optionName;
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
      optionName = data.optionName;
      $("#optionName").html(`[${optionName}]`);

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

    // case "afterAccept":
    //   data.odds
    // break;
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
}

let matchButtonDownTime = 0;
$("#matchButton").on("click", e=>{
  if(!flag.bet365LoginComplete){
    log("벳365 로그인 중입니다.");
    return;
  }
  if(Date.now() - matchButtonDownTime > 300){
    matchButtonDownTime = Date.now();
    if(flag.isMatching){
      stopMatch(true);
    }else{
      startMatch(true);
    }
  }
})

function updateMatchButtonState(){
  if(flag.isMatching){
    $("#matchButton").removeClass("btn-success").addClass("btn-warning").html("매칭중지");
  }else{
    $("#matchButton").removeClass("btn-warning").addClass("btn-success").html("매칭시작");
  }
}

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

async function getBets(betData, timeout=0){
  if(betData.status == "PENDING_ACCEPTANCE"){
    log(`배팅확인중..`, null, true);
    let isTimeout, itv;
    if(timeout>0){
      itv = setTimeout(()=>{
        isTimeout = true;
      }, timeout);
    }
    while(1){
      if(isTimeout){
        betData.straightBet = null;
        betData.status = "TIMEOUT";
        break;
      }
      let bd = await sendData("getBets", betData.uniqueRequestId, PN_BG);
      console.error(bd);
      if(bd.straightBets && bd.straightBets.length){
        if(bd.straightBets[0].betStatus == "PENDING_ACCEPTANCE"){
          await delay(2000);
          continue;
        }
        // betData
        // return bd.straightBets[0];
        betData.straightBet = bd.straightBets[0];
        betData.status = "ACCEPTED";
        break;
      }
    }
    clearTimeout(itv);
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

          case "TIMEOUT":
            log(`피나클 배팅실패. 시간초과.`, "danger", true);
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
      log(`수익률: <span class="text-info">${printPercent(profitP)}</span>`, null, true);
    }
    return true;
  }else{
    if(!noLog){
      log(`수익률 <span class="text-danger">${printPercent(betOption.profitP/100)} 미만(${printPercent(profitP)})</span>`, null, true);
    }
    return false;
  }
}

function validProfit(oddsA, oddsB, stakeA, noLog){
  let profit = calc.profit(oddsA, oddsB, stakeA);
  if(profit >= betOption.profit){
    if(!noLog){
      log(`수익: <span class="text-info">$${round(profit,2)}</span>`, null, true);
    }
    return true;
  }else{
    if(!noLog){
      log(`수익 <span class="text-danger">$${round(betOption.profit,2)} 미만($${round(profit,2)})</span>`, null, true);
    }
    return false;
  }
}

function hasEventMark(id){
  return !!getData(id);
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
  if(hasEventMark(id)){
    getEventMark(id).ben = false;
  }
}

function isBenEvent(id){
  return hasEventMark(id) && (!!getEventMark(id).ben);
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
      // await vlProcess(data);
      console.error("준비되지 않은 처리:", betOption.action);
    }else{
      console.error("준비되지 않은 처리:", betOption.action);
    }
    isCheckingMatch = false;
    // log('이벤트 수신 대기중', "primary", true);
  }
}

let currentGameData;
async function findMatch2(data){
  console.error("findMatch2", {isCheckingMatch});
  if(isCheckingMatch){
    return;
  }

  currentGameData = data;
  // let data = getNextData();
  // && data.pinnacle.sports == "Soccer"
  if(data){
    isCheckingMatch = true;
    if(betOption.action == "yb"){
      await userYbProcess(currentGameData.betburger);
    }else if(betOption.action == "vl"){
      //betmax로 벨류
      // await userVlProcess(currentGameData.betburger);
      console.error("준비되지 않은 처리:", betOption.action);
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
      }else if(isBenEvent(data.bet365.id)){
        console.log(`제외된 이벤트: ${data.bet365.id}`);
        // log(`제외된 이벤트: ${data.pinnacle.id}`, "warning", true);
        continue;
      }else if(isBenEvent(data.pinnacle.id+':'+data.bet365.id)){
        console.log(`제외된 이벤트: ${data.pinnacle.id+':'+data.bet365.id}`);
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

}

function getEventIds(data){
  return {
    peId: data.pinnacle.id,
    beId: data.bet365.id,
    matchId: data.pinnacle.id + ':' + data.bet365.id
  }
}

function updateBet365Link(data){
  data.bet365.betLink = data.bet365.betLink.replace(/~(\d+\.?\d*)&/, (origin, found)=>{
    return origin.replace(found, data.bet365.odds);
  })
}

function updateBet365Stake(data){
  // 유저 양빵단계의 벳삼 배당 변동시에는 벳삼 stake를 다시 계산해주고 판단한다.
  data.bet365.stake = round(calc.stakeB(data.pinnacle.odds, data.bet365.odds, data.pinnacle.stake), 2);
}

function updatePncStake(data){
  data.pinnacle.stake = round(calc.stakeB(data.bet365.odds, data.pinnacle.odds, data.bet365.stake), 2);
}

function changeOddsBet365Process(data, odds){
  if(data.bet365.odds != odds){
    log(`벳365 배당변동: ${data.bet365.odds} -> ${odds}`, data.bet365.odds < odds ? "info" : "danger", true);
    data.bet365.odds = odds;
    return true;
    // // 유저 양빵단계의 벳삼 배당 변동시에는 벳삼 stake를 다시 계산해주고 판단한다.
    // data.bet365.stake = calc.stakeB(data.pinnacle.odds, data.bet365.odds, data.pinnacle.stake);
  }
  return false;
}

function profitValidation(data, noLog){
  return validProfit(data.pinnacle.odds, data.bet365.odds, data.pinnacle.stake, noLog);
}

function profitPValidation(data, noLog){
  return validProfitP(data.pinnacle.odds, data.bet365.odds, noLog);
}

function profitAllValidation(data, noLog){
  return validProfitP(data.pinnacle.odds, data.bet365.odds, noLog) && validProfit(data.pinnacle.odds, data.bet365.odds, data.pinnacle.stake, noLog);
}

function checkLakeMoney(data, money){
  if(money < data.bet365.stake){
    log(`배팅취소: 벳365 잔액부족 ($${data.bet365.stake}/$${money})`, 'danger', true);
    stopMatch(true);
    return true;
  }
  return false;
}

async function openBet365AndGetInfo(data){
  activeBet365();
  let bet365Info = await sendData("setUrl", data.bet365.betLink, PN_B365);
  activeMain();
  if(!bet365Info){
    log(`벳365 링크열기 실패`, "danger", true);
    return;
  }else{
    log(`벳365 확인: ${data.bet365.odds}`, null, true);
    console.log("bet365 info", bet365Info);
    console.log("betburger info", data.bet365);
    // if(bet365Info.money < data.bet365.stake){
    //   log(`배팅취소: 벳365 잔액부족 ($${data.bet365.stake}/$${bet365Info.money})`, 'danger', true);
    //   stopMatch(true);
    //   return;
    // }
  }
  return bet365Info;
}

function printGame(data){
  log(`
    <div>종목: ${data.pinnacle.sports} (${data.pinnacle.betType})</div>
    <div>수익률: ${Math.floor(data.pinnacle.profitP*10000)/100}%</div>
    <div><span class="text-warning">피나클</span>: ${data.pinnacle[data.pinnacle.homeAway]} (<span class="text-info">${data.pinnacle.odds}</span>) <span class="text-warning">${data.pinnacle.type.code}</span> ${data.pinnacle.type.set}</div>
    <div><span class="text-success">벳365</span>: ${data.bet365[data.bet365.homeAway]} (<span class="text-info">${data.bet365.odds}</span>) <span class="text-warning">${data.bet365.type.code}</span> ${data.bet365.type.set}</div>
  `, null, true);
}

// 유저 양빵 처리
async function userYbProcess(data){
  console.log(data);
  let ids = getEventIds(data);
  printGame(data);

  let bet365Info, checkProfit;
  bet365Info = await openBet365AndGetInfo(data);
  if(!bet365Info){
    return;
  }

  if(checkLakeMoney(data, bet365Info.money)){
    return;
  }

  if(changeOddsBet365Process(data, bet365Info.odds)){
    updateBet365Stake(data);
  }
  checkProfit = profitAllValidation(data);

  if(checkProfit){
    if(!flag.isMatching) return;
    activeBet365();
    // log(`벳365 배팅시작`, "info", true);
    let result, checkBet, isChangeOdds, isFirst = true, lakeMoney;
    while(1){
      if(checkProfit){
        if(isChangeOdds || isFirst){
          isFirst = false;
          isChangeOdds = false;
          log(`벳365 배팅시작 <span class="text-warning">$${data.bet365.stake}</span>`, "info", true);
        }
        result = await sendData("placeBet", data.bet365.stake, PN_B365);
        console.log("bet365 betting..", result);
        if(result === undefined){
          log("벳365 배팅실패: 응답없음.", "danger", true);
          break;
        }

        if(result.status == "acceptChange"){
          isChangeOdds = changeOddsBet365Process(data, result.info.odds);
          if(isChangeOdds){
            updateBet365Stake(data);
            checkProfit = profitAllValidation(data);
          }
        }else if(result.status == "lakeMoney"){
          log(`벳365 잔액부족 stake:$${result.stake}, money:$${result.money}`, "danger", true);
          changeOddsBet365Process(data, result.info.odds);
          data.bet365.stake = result.money;
          updatePncStake(data);
          checkProfit = profitAllValidation(data);
          lakeMoney = true;
        }else if(result.status == "success"){
          log(`벳365 배팅완료!`, "success", true);
          checkBet = true;
          break;
        }else{
          log(`벳365 배팅실패: ${result.message}`, "danger", true);
          break;
        }
      }else{
        log(`배팅취소`, 'danger', true);
        break;
      }
    }
    activeMain();
    console.log("bet365 bet complete", result);

    if(checkBet){
      sendDataToServer("updateMoney", result.money - result.stake);
      await delay(100);
      // 사이트 배팅
      log(`피나클 배팅시작 <span class="text-warning">$${data.pinnacle.stake}</span>`, "info", true);
      // 배팅정보 저장
      let res = await api.bet({
        account: account._id,
        event: currentGameData._id,
        betId: currentGameData.betId,
        siteOdds: data.pinnacle.odds,
        siteStake: data.pinnacle.stake,
        bookmakerOdds: data.bet365.odds,
        bookmakerStake: data.bet365.stake,
        bookmaker: result
      })
      if(res.status == "success"){
        log(`피나클 배팅완료!`, "success", true);
      }else{
        log(`피나클 배팅실패: ${res.message}`, "danger", true);
      }
    }

    if(lakeMoney){
      stopMatch(true);
      return;
    }
  }else{
    log(`배팅취소`, 'danger', true);
    return;
  }
}

async function checkBetmaxProcess(data){
  console.log(data);
  let ids = getEventIds(data);
  printGame(data);

  console.error("wait pnc balance");
  let balance = await sendData("getBalance", null, PN_BG);
  if(balance.availableBalance < 10){
    log(`피나클 충전이 필요합니다. ($${balance.availableBalance})`, "warning", true);
    stopMatch(true);
    return;
  }else{
    log(`피나클 잔액: $${balance.availableBalance}`, null, true);
  }
  if(!flag.isMatching) return;
  console.error("wait getLine");
  let line = await sendData("getLine", data.pinnacle, PN_BG);
  let checkLine;
  console.error({line});
  if(line && line.lineData){
    if(line.lineData.status == "SUCCESS"){
      checkLine = true;
      log(`라인확인: ${line.lineData.price}`, null, true);
      if(data.pinnacle.odds != line.lineData.price){
        log(`피나클 배당변동: ${data.pinnacle.odds} -> ${line.lineData.price}`, data.pinnacle.odds < line.lineData.price ? "info" : "danger", true);
        data.pinnacle.odds = line.lineData.price;
      }
    }else{
      console.error(line.lineData.status);
      log(`라인찾기실패: ${line.lineData.status}`, "danger", true);
      benEvent(ids.peId, 0);
      return;
      // let count = lineFindFailCountUp(ids.peId);
      // if(count >= 2){
      //   benEvent(ids.peId, 0, "2 연속 못찾음");
      // }
    }
  }else{
    log(`이벤트로드 실패`, "danger", true);
    benEvent(ids.peId, 0);
    return;
  }

  if(!flag.isMatching) return;

  let bet365Info, checkProfit;
  // #2 벳삼열어서 배당 및 타입체크
  if(checkLine){
    bet365Info = await openBet365AndGetInfo(data);
    if(!bet365Info){
      return;
    }

    if(checkLakeMoney(data, 1)){
      return;
    }

    if(changeOddsBet365Process(data, bet365Info.odds)){
      updateBet365Link(data);
    }

    // betmax 확인전에는 수익률로만 판단
    checkProfit = profitPValidation(data);

    if(!checkProfit){
      benEvent(ids.matchId, 10000);
      log(`배팅취소`, 'danger', true);
      return;
    }
  }

  let checkPinnacleBet, betResult;
  // #3 피나클 배팅.
  if(checkProfit){
    if(!flag.isMatching) return;
    betResult = await placeBet(line);
    if(betResult.status == "success"){
      // 피나클 배팅완료후, 배팅된 배당으로 다시 수익률을 판단할 필요가 있나 ?
      // checkProfit = validProfitP(betResult.data.price, bet365Info.odds);
      if(betResult.data.price != data.pinnacle.odds){
        log(`피나클배팅후 배당바뀜: ${data.pinnacle.odds} -> ${betResult.data.price}`, data.pinnacle.odds < betResult.data.price ? "info" : "danger", true);
        data.pinnacle.odds = betResult.data.price;
        // checkProfit = validProfitP(data.bet365.odds, data.pinnacle.odds, true) && validProfit(data.bet365.odds, data.pinnacle.odds, data.bet365.stake, true);
        checkProfit = profitPValidation(data);
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
      updatePncStake(data);
      log(`
        <div class="text-info">------ 데이터 전송 ------</div>
        <div class="text-warning">피나클: $${data.pinnacle.stake} (${data.pinnacle.odds})</div>
        <div class="text-success">벳365: $${data.bet365.stake} (${data.bet365.odds})</div>
      `, null, true);

      betResult.data.betburger = data;
      betResult.data._id = betResult.data.uniqueRequestId;
      betResult.data.bookmaker = betmaxInfo;
      sendDataToServer("inputGameData", betResult.data);
    }else{
      log(`배팅취소`, 'danger', true);
    }
  }
}//end checkBetmaxProcess

async function vlProcess(data){

}

function startMatch(sync){
  log("-------- 매칭켜짐 --------", "info", true);
  flag.isMatching = true;
  updateMatchButtonState();
  if(sync){
    sendDataToSite("receiveMatchFlag", flag.isMatching);
  }
}

function stopMatch(sync){
  log("-------- 매칭꺼짐 --------", "danger", true);
  flag.isMatching = false;
  updateMatchButtonState();
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
    // console.error("getState", r);
    // console.error("send resolve", uuid);
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

    console.log("receive gamedata", data);
    let gd;
    try{
      gd = JSON.parse(data.data);
    }catch(e){
      console.error("gamedata parsing error. data:", data);
      return;
    }
    setData("gamedata", gd);

    if(!flag.isMatching) return;
    // sendData("gamedata", data, "bg");

    // console.log("gamedata", gd);

    findMatch();
  })

  socket.on("gamedata2", data=>{
    if(!flag.bet365LoginComplete) return;

    console.log("receive gamedata2");
    setData("gamedata", data);
    if(!flag.isMatching) return;
    // sendData("gamedata", data, "bg");
    // let gd = JSON.parse(data);
    // console.log("gamedata", data);
    //
    findMatch2(data);
  })

}


init();
