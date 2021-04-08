console.log("bet365Withdraw.js");

window.addEventListener("load", ()=>{
  // window.addEventListener("message", e=>{
  //   let {com, data} = e.message;
  //   console.error({com, data});
  // })
  setTimeout(async ()=>{

    let param = window.location.href.split('?').pop().split('&').reduce((r,v)=>{
      let kv = v.split('=');
      r[kv[0]] = kv[1];
      return r;
    }, {});

    console.error("param", param);

    let {key, data} = param;

    localStorage.setItem('wkey', key);

    data = decodeURIComponent(data);
    data = data.split('').reverse().join('');
    data = data.split(':');

    $("#ctl00_Main_withdrawal_ctl00_tAmt").val(data[1]);
    await delay(200);
    $("#ctl00_Main_withdrawal_ctl00_tPwd").val(data[0]);
    await delay(200);
    $("#ctl00_Main_withdrawal_ctl00_lkSbmt")[0].click();

    setTimeout(()=>{
      chrome.runtime.sendMessage({com:"withdrawComplete", data:{withdrawKey:key, money:null}, to:"bg"});
    }, 10000);
    // data = {withdrawKey:key};
    // window.parent.postMessage(data, "*");

    // await delay(100);

    //출금 클릭하면 balance페이지로 간다.  bet365Balance.js에서 이어지도록 처리
    // data = {withdrawKey:key};
    // window.parent.postMessage(data, "*");
  }, 500)
})
