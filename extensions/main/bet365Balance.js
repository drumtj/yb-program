console.log("bet365Balance.js");

window.addEventListener("load", ()=>{
  setTimeout(async ()=>{

    let param = window.location.href.split('?').pop().split('&').reduce((r,v)=>{
      let kv = v.split('=');
      r[kv[0]] = kv[1];
      return r;
    }, {});
    let withdrawKey = localStorage.getItem('wkey');
    localStorage.removeItem('wkey');

    // let isWithdrawComplete;
    // if(withdrawKey){
    //   await until(()=>{
    //     return $("#ctl00_Main_balances_pnlMsg_divLine1").text().length > 0
    //   }, 5000);
    //   if($("#ctl00_Main_balances_pnlMsg_divLine1").text().trim() == "Withdrawal Request Received"){
    //     isWithdrawComplete = true;
    //   }
    // }
    // console.error("body", document.body.outerHTML);
    // console.error("!", $(".balance-column").text());
    // console.error("?", $(".balance-row:first>.balance-column:last>div:last"));
    let moneyText = $(".balance-row:first>.balance-column:last>div:last").text().trim();
    // console.error("??", moneyText);
    moneyText = moneyText.replace(/[^0-9.,]/g,'');
    if(moneyText.indexOf('.') == -1 && moneyText.indexOf(',') > -1){
      moneyText = moneyText.replace(/,/g, '.');
    }
    let money = parseFloat(moneyText);
    // let key = window.location.href.split('&').pop().replace('key=', '');
    let {key} = param;



    let data = {key, money, withdrawKey};//, url:window.location.href};
    console.error('data', data);
    // console.error('opener', window.opener);
    if(withdrawKey){
      chrome.runtime.sendMessage({com:"withdrawComplete", data, to:"bg"});
      // window.opener.postMessage(data, "*");
    }else{
      window.parent.postMessage(data, "*");
    }
  }, 500)
})
