console.log("bet365.js");



log.setSendFunc = sendData;

async function onMessage(message){
  if(message.com){
    console.log("onMessage", message);
  }
  let {com, data} = message;
  let resolveData;
  switch(com){
    case "test":
      resolveData = "test!!" + data;
    break;

    case "login":
      setInitMessage(message);
      console.log("login start");
      let money = await login(data.id, data.pw);
      console.log("login. money", money);
      setInitMessage(null);
      setData("money", money);
      resolveData = money;
    break;
  }
  return resolveData;
}

let messagePromises = {};
function setupOnMessage(){
  chrome.runtime.onMessage.addListener(async (message,sender,sendResponse)=>{
    // console.log("message", message);
    // let {com, data, to} = message;
    let {com, data, to, from, _code, _rcode} = message;
    let resolveData = await onMessage(message);
    // console.log("resolveData", resolveData);
    if(_code){
      sendResolveData(_code, resolveData, from);
    }else if(_rcode && messagePromises[_rcode]){
      messagePromises[_rcode](data);
    }
  })
}

function sendData(com, data, to, noResolve){
  let msg = {com, data, to, from:PN_B365};
  if(noResolve){
    console.log("sendData", msg);
    chrome.runtime.sendMessage(msg);
    return;
  }
  let mid = guid();
  let _code = com+'@'+mid;
  msg._code = _code;

  console.log("sendData", msg);
  chrome.runtime.sendMessage(msg);
  return new Promise(resolve=>{
    messagePromises[_code] = (d)=>{
      delete messagePromises[_code];
      resolve(d);
    }
  })
}

function sendResolveData(_code, data, to){
  chrome.runtime.sendMessage({_rcode:_code, data, to, from:PN_B365});
}

function parseMoney(str){
  console.error("parseMoney", str);
  return parseFloat(str.replace(/[^0-9.]/g,''));
}

async function login(id, pw){

  let $btn = await findEl([
    ".hm-MainHeaderRHSLoggedOutWide_Login",
    ".hm-MainHeaderRHSLoggedOutNarrow_Login",
    ".hm-MainHeaderRHSLoggedOutMed_Login",
    ".hm-Balance"
  ], 10000);

  if(!$btn){
    console.error("로긴버튼이나 잔액을 찾을 수 없음.");
    return null;
  }


  let $money;
  if($btn.hasClass("hm-Balance")){
    $money = $btn;
  }else{
    $btn.click();

    let $username = await findEl(".lms-StandardLogin_Username", 5000);

    if(!$username){
      console.error("아이디 입력창을 찾을 수 없음.");
      return null;
    }



    $(".lms-StandardLogin_Username").val(id);
    $(".lms-StandardLogin_Password").val(pw);
    $(".lms-StandardLogin_LoginButtonText").click();
  }

  if(!$money){
    $money = await findEl(".hm-Balance", 5000);
  }

  // console.error("$money", $money);

  if($money){
    await until(()=>{
      return $money.text();
    })
    return parseMoney($money.text());
  }else{
    console.error("로그인 클릭 후 잔액을 확인 할 수 없음. 비번틀렸을 가능성 있음");
    return null;
  }

}

function setInitMessage(message){
  sendData("setBet365InitMessage", message, PN_BG, true);
}

(async ()=>{

  setupOnMessage();

  sendData("readyBet365", null, PN_BG);

  // let _guid = localStorage.getItem('bet365_guid');
  // if(_guid){
  //   await sendData("readyBet365", _guid, PN_BG);
  // }else{
  //   _guid = await sendData("readyBet365", null, PN_BG);
  //   localStorage.setItem('bet365_guid', _guid);
  // }
  // let account = await sendData("getAccount", null, PN_BG);
  // if(!account){
  //   return;
  // }
  // let money = await login(account.id, account.pw);
  // log(`bet365 (${account.id}) 로그인 완료. 잔액: ${money}`);

  // money = await login(id, pw);


})()
