console.log("bet365Balance.js");

window.addEventListener("load", ()=>{
  let money = parseFloat($("#dSTtlVal").text().replace(/[^0-9.]/g,''));
  let key = window.location.href.split('&').pop().replace('key=', '');

  let data = {key, money};
  console.error(data);

  window.parent.postMessage(data, "*");
})
