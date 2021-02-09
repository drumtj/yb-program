// console.log("bet365.js");



//
//
// function removeModal(){
//   $(".wcl-ModalManager_DarkWash ").remove();
//   $(".lp-UserNotificationsPopup_FrameContainer").remove();
// }
//
// async function getMoneyInBetslip(){
//   await until(()=>{
//     return $(".bs-Balance_Value").text().replace(/[^0-9]/g, '').length > 0;
//   }, 2000)
//   return parseMoney($(".bs-Balance_Value").text())
// }
//
// async function getBetslipInfo(opt){
//   let money;
//   if(opt && opt.withMoney){
//     money = await getMoneyInBetslip();
//     // money = await getMoneyInBetslip();
//   }
//
//   return {
//     title: $(".bss-NormalBetItem_Title").text(),
//     handicap: $(".bss-NormalBetItem_Handicap").text(),
//     market: $(".bss-NormalBetItem_Market").text(),
//     odds: parseFloat($(".bs-OddsLabel>span:first").text()),
//     money: money
//   }
// }
//
// function findPlaceBetBtn(timeout=0){
//   return findEl(".bss-PlaceBetButton:not(.hidden):not(.disabled):visible", timeout);
// }
//
// function findAcceptBtn(timeout=0){
//   return findEl(".bs-AcceptButton:not(.hidden):not(.disabled):visible", timeout);
// }
//
// function findAcceptOrPlacebetBtn(timeout=0) {
//   return findElAll([
//     ".bs-AcceptButton:not(.hidden):not(.disabled):visible",
//     ".bss-PlaceBetButton:not(.hidden):not(.disabled):visible"
//   ], timeout);
// }
//
// function findAcceptOrPlacebetOrPlaced(timeout=0) {
//   return findElAll([
//     ".bs-AcceptButton:not(.hidden):not(.disabled):visible",
//     ".bss-PlaceBetButton:not(.hidden):not(.disabled):visible",
//     ".bss-ReceiptContent:not(.hidden):not(.disabled):visible"
//   ], timeout);
// }
//
// function betslipMessage(){
//   return $(".bss-Footer_MessageBody").text();
// }
//
// async function getBetmax(timeout=0) {
//   await until(()=>{
//     return $(".bss-Footer_MessageBody").text().length>0
//   }, timeout)
//   let a = $(".bss-Footer_MessageBody").text().trim();
//   let m = a.match(/Stake\/risk entered.+available maximum of (.\d+\.?\d*)/);
//   if(m){
//     return parseFloat(m[1].replace(/[^0-9.]/g, ''));
//   }
//   return null;
// }
//
// function activeBet365(){
//   sendData("activeBet365", null, PN_BG, true);
// }
//
// function activeMain(){
//   sendData("activeMain", null, PN_BG, true);
// }
//
// async function onMessage(message){
//   if(message.com){
//     console.log("onMessage", message);
//   }
//   let {com, data} = message;
//   let resolveData;
//   switch(com){
//     case "test":
//       resolveData = "test!!" + data;
//     break;
//
//     case "login":
//       setInitMessage(message);
//       console.log("login start");
//       let money = await login(data.id, data.pw);
//       delay(2000).then(removeModal);
//       localStorage.setItem("id", data.id);
//       document.title = data.id;
//       console.log("login. money", money);
//       setInitMessage(null);
//       // let limited = await until(()=>{
//       //   let $iframe = $(".lp-UserNotificationsPopup_Frame");
//       //   console.error("find iframe");
//       //   if($iframe.length == 0){
//       //     return false;
//       //   }
//       //   console.error("found iframe");
//       //   let doc = $iframe.get(0).contentDocument;
//       //   console.error("?", $(".modal-title", doc).length, $(".modal-title", doc).text());
//       //   return $(".modal-title", doc).text().trim() == "Restrictions have been applied to your account";
//       // }, 5000);
//       // console.log("limited", limited);
//       setData("money", money);
//       // resolveData = {money, limited};
//       resolveData = money;
//     break;
//
//     case "dev":
//       try{
//         console.log(eval(data));
//       }catch(e){
//         console.error(e);
//       }
//     break;
//
//     case "setUrl":
//       setInitMessage(message);
//       console.error("setUrl", data);
//       let f = localStorage.getItem("setUrl");
//       console.error('f', f);
//       if(!f){
//         localStorage.setItem("setUrl", true);
//         window.location.href = data;
//         await pause();
//       }
//       localStorage.removeItem("setUrl");
//       //   localStorage.setItem("setUrl", true);
//       // }else{
//       //   localStorage.removeItem("setUrl", true);
//       // }
//
//       // await delay(4000);
//
//       // let startTime = Date.now();
//       let timeout = 20 * 1000;
//       // let overTimeout;
//
//       let cancelObj = {};
//       let found = await until(()=>{
//         // if(Date.now() - startTime > timeout){
//         //   overTimeout = true;
//         //   return true;
//         // }
//         return $(".bss-NormalBetItem_Title").text().length > 0;
//       }, timeout, cancelObj);
//
//       if(!found){
//         console.error("뱃삼페이지 대기시간 초과로 새로고침함.");
//         cancelObj.cancel();
//         window.location.reload();
//         await pause();
//       }
//
//       setInitMessage(null);
//       removeModal();
//       // let r = await getBetslipInfo({withMoney:true});
//       let r = await getBetslipInfo();
//       r.money = await getMoney(10000);
//       // let r = {
//       //   title: $(".bss-NormalBetItem_Title").text(),
//       //   handicap: $(".bss-NormalBetItem_Handicap").text(),
//       //   market: $(".bss-NormalBetItem_Market").text(),
//       //   odds: parseFloat($(".bs-OddsLabel>span:first").text())
//       // }
//       console.error("bet365 bet info", r);
//       resolveData = r;
//     break;
//
//     case "placeBet":
//       // setInitMessage(message);
//       await (async ()=>{
//         let count = 0, stake = data, lakeMoney, status = {};
//         while(1){
//           // inputWithEvent($input[0], stake);
//           await delay(100);
//           let btns = await findAcceptOrPlacebetOrPlaced(5000);
//           await delay(100);
//           console.log("find btns", btns);
//           let $acceptBtn = btns[0];
//           let $placeBetBtn = btns[1];
//           let $placed = btns[2];
//
//           let info = await getBetslipInfo();
//           let message;
//
//           if(!$placed && ($placeBetBtn || $acceptBtn)){
//             if(status.afterPlaceBet){
//
//             }else if(status.afterAccept){
//               // await sendData("afterAccept", info);
//               resolveData = {
//                 status: "acceptChange",
//                 info
//               }
//               break;
//             }
//           }
//
//           let money = await getMoney();
//           console.log("bg money", money);
//           lakeMoney = money < stake;
//           if(lakeMoney){
//             // stake = money;
//             resolveData = {
//               status: "lakeMoney",
//               info,
//               money,
//               stake
//             }
//             break;
//           }
//
//
//
//           if($placed){
//             console.log("bet complete");
//             // await delay(1000);
//             // let money = await getMoney();
//             resolveData = {
//               status: "success",
//               info,
//               money,
//               stake
//             }
//             break;
//           }else if($placeBetBtn){
//             console.log("click placebet");
//             status.afterAccept = false;
//             status.afterPlaceBet = true;
//             await delay(100);
//
//             // await until(()=>$(".bss-StakeBox_StakeValueInput").length>0);
//             await inputWithEvent(".bss-StakeBox_StakeValueInput", stake);
//             await delay(100);
//
//             $placeBetBtn.click();
//             await delay(1000);
//             message = betslipMessage();
//             console.error("placebet message:", message);
//             // if(message.indexOf("sorry, you do have enough funds in your account to place this bet") > -1){
//             //   // 잔액부족
//             // }
//           }else if($acceptBtn){
//             betmax = await getBetmax(200);
//             status.afterAccept = true;
//             status.afterPlaceBet = false;
//             console.log("betmax", betmax);
//             if(betmax == null){
//               console.log("click accept");
//               $acceptBtn.click();
//             }else if(betmax == 0){
//               console.log("betmax is 0");
//               resolveData = {
//                 status: "fail",
//                 message: "betmax 한도없음"
//               };
//               break;
//             }else{
//               console.log("find betmax");
//               stake = betmax;
//               await inputWithEvent(".bss-StakeBox_StakeValueInput", stake);
//               await delay(100);
//               $acceptBtn.click();
//             }
//             await delay(1000);
//             message = betslipMessage();
//             console.error("accept message:", message);
//           }else{
//             if(!info.title){
//               console.error("placeBet, acceptBtn, placed  못찾음", count);
//               count++;
//             }else{
//               console.error("배팅완료 대기중");
//             }
//           }
//
//           if(count>=2){
//             console.error("너무 많이 못찾음. 문제있다.");
//             resolveData = null;
//             break;
//           }
//         }
//       })()
//       // setInitMessage(null);
//     break;
//
//     case "getBetmax":
//       await (async ()=>{
//         let betmax, count = 0, info, balance;
//
//         while(1){
//           // inputWithEvent($input[0], stake);
//           await delay(100);
//           let btns = await findAcceptOrPlacebetBtn(5000);
//           console.log("find btns", btns);
//           let $acceptBtn = btns[0];
//           let $placeBetBtn = btns[1];
//
//           let message;
//
//           if($placeBetBtn){
//             console.log("click placebet");
//             await delay(100);
//             // await sendData("getBetmax", stake);
//             balance = parseMoney($(".bs-Balance_Value").text());
//             let stake = Math.min(balance, 200);
//             await until(()=>$(".bss-StakeBox_StakeValueInput").length>0);
//             inputWithEvent(".bss-StakeBox_StakeValueInput", stake);
//             await delay(100);
//
//             $placeBetBtn.click();
//           }else if($acceptBtn){
//             betmax = await getBetmax();
//             console.log("betmax", betmax);
//             if(betmax == null){
//               console.log("click accept");
//               $acceptBtn.click();
//             }else{
//               console.log("complete");
//               balance = parseMoney($(".bs-Balance_Value").text());
//               info = await getBetslipInfo();
//               resolveData = {
//                 balance, betmax, info
//               }
//               break;
//             }
//           }else{
//             console.error("placeBet, acceptBtn 둘다 못찾음", count);
//             count++;
//           }
//
//           if(count>2){
//             console.error("너무 많이 못찾음. 문제있다.");
//             resolveData = null;
//             break;
//           }
//         }
//         // let betmaxText = (await findEl(".aaa")).text();
//         // let betmax = 1;//betmaxText;
//
//         // await pause();
//         //여기서 최종 확인된 벳맥스랑, 현재 잔액을 main에 보내자. main에서는 잔액이 이전잔액과 다르면 update요청보내자
//       })()
//
//     break;
//   }
//   return resolveData;
// }
//
// let messagePromises = {};
// function setupOnMessage(){
//   chrome.runtime.onMessage.addListener(async (message,sender,sendResponse)=>{
//     // console.log("message", message);
//     // let {com, data, to} = message;
//     let {com, data, to, from, _code, _rcode} = message;
//     let resolveData = await onMessage(message);
//     // console.log("resolveData", resolveData);
//     if(_code){
//       sendResolveData(_code, resolveData, from);
//     }else if(_rcode && messagePromises[_rcode]){
//       messagePromises[_rcode](data);
//     }
//   })
// }
//
// function sendData(com, data, to, noResolve){
//   let msg = {com, data, to, from:PN_B365};
//   if(noResolve){
//     console.log("sendData", msg);
//     chrome.runtime.sendMessage(msg);
//     return;
//   }
//   let mid = guid();
//   let _code = com+'@'+mid;
//   msg._code = _code;
//
//   console.log("sendData", msg);
//   chrome.runtime.sendMessage(msg);
//   return new Promise(resolve=>{
//     messagePromises[_code] = (d)=>{
//       delete messagePromises[_code];
//       resolve(d);
//     }
//   })
// }
//
// function sendResolveData(_code, data, to){
//   chrome.runtime.sendMessage({_rcode:_code, data, to, from:PN_B365});
// }
//
// async function getMoney(timeout=2000){
//   await until(()=>{
//     return $(".hm-Balance:first").text().replace(/[^0-9]/g, '').length > 0;
//   }, timeout)
//   return parseMoney($(".hm-Balance:first").text());
// }
//
// function parseMoney(str){
//   console.error("parseMoney", str);
//   return parseFloat(str.replace(/[^0-9.]/g,''));
// }
//
// async function login(id, pw){
//
//   let $btn = await findEl([
//     ".hm-MainHeaderRHSLoggedOutWide_Login",
//     ".hm-MainHeaderRHSLoggedOutNarrow_Login",
//     ".hm-MainHeaderRHSLoggedOutMed_Login",
//     ".hm-Balance"
//   ], 15000);
//
//   if(!$btn){
//     console.error("로긴버튼이나 잔액을 찾을 수 없음. 새로고침");
//     window.location.reload();
//     await pause();
//     // return null;
//   }
//
//
//   let $money;
//   if($btn.hasClass("hm-Balance")){
//     // $money = $btn;
//     await until(()=>{
//       return $btn.text();
//     })
//     return parseMoney($btn.text());
//   }else{
//     $btn.click();
//
//     let $username = await findEl(".lms-StandardLogin_Username", 5000);
//
//     if(!$username){
//       console.error("아이디 입력창을 찾을 수 없음.");
//       return null;
//     }
//
//
//
//     // $(".lms-StandardLogin_Username").val(id);
//     inputWithEvent(".lms-StandardLogin_Username", id);
//     await delay(200);
//     // $(".lms-StandardLogin_Password").val(pw);
//     inputWithEvent(".lms-StandardLogin_Password", pw);
//     await delay(200);
//     $(".lms-StandardLogin_LoginButtonText").click();
//     // 여기서 새로고침된다.
//
//     await delay(15000);
//     log("로그인 클릭 후 잔액을 확인 할 수 없음. 비번틀렸을 가능성 있음. 수동로긴 대기중");
//     await pause();
//   }
//   //
//   // console.log($money);
//   // $money = null;
//   // if(!$money){
//   //   // $money = await findEl(".hm-Balance", 5000);
//   //   await delay(5000);
//   // }
//   //
//   // // console.error("$money", $money);
//   //
//   // if($money){
//   //   await until(()=>{
//   //     return $money.text();
//   //   })
//   //   return parseMoney($money.text());
//   // }else{
//   //   // console.error("로그인 클릭 후 잔액을 확인 할 수 없음. 비번틀렸을 가능성 있음. 수동로긴 대기중");
//   //   log("로그인 클릭 후 잔액을 확인 할 수 없음. 비번틀렸을 가능성 있음. 수동로긴 대기중");
//   //   $money = await findEl(".hm-Balance");
//   //   return parseMoney($money.text());
//   //   // return null;
//   // }
//
// }
//
// function setInitMessage(message){
//   sendData("setBet365InitMessage", message, PN_BG, true);
// }
//
// (async ()=>{
//
//   setupOnMessage();
//
//   let id = localStorage.getItem("id");
//   if(id){
//     document.title = id;
//   }
//
//   sendData("readyBet365", null, PN_BG);
//
//   // let _guid = localStorage.getItem('bet365_guid');
//   // if(_guid){
//   //   await sendData("readyBet365", _guid, PN_BG);
//   // }else{
//   //   _guid = await sendData("readyBet365", null, PN_BG);
//   //   localStorage.setItem('bet365_guid', _guid);
//   // }
//   // let account = await sendData("getAccount", null, PN_BG);
//   // if(!account){
//   //   return;
//   // }
//   // let money = await login(account.id, account.pw);
//   // log(`bet365 (${account.id}) 로그인 완료. 잔액: ${money}`);
//
//   // money = await login(id, pw);
//
//
// })()
