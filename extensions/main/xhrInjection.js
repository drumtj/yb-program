function interceptData() {
  var xhrOverrideScript = document.createElement('script');
  xhrOverrideScript.type = 'text/javascript';
  xhrOverrideScript.innerHTML = `
  (function() {
    if(!window._xhrcustom){
      var XHR = XMLHttpRequest.prototype;
      window._xhrcustom = true;
      var send = XHR.send;
      var open = XHR.open;
      XHR.open = function(method, url) {
          this.url = url; // the request url
          return open.apply(this, arguments);
      }
      XHR.send = function() {
        if(this.url.includes('/BetsWebAPI/refreshslip')) {
          // console.error('listen!');
          this.addEventListener('load', e=>{
            // console.error("loaded", this.responseText);
            try {
              let o = JSON.parse(this.responseText);
              localStorage.setItem('betGuid', o.bg);
              localStorage.setItem('refreshData', this.responseText);
              console.error('loaded betGuid', o.bg);
            }catch(e){
              localStorage.removeItem('betGuid');
              localStorage.removeItem('refreshData');
              console.error('betGuid parse fail');
            }
          },{once:true})
        }
        return send.apply(this, arguments);
      };
    }
  })();
  `
  document.head.prepend(xhrOverrideScript);
}
function checkForDOM() {
  if (document.body && document.head) {
    interceptData();
  } else {
    requestIdleCallback(checkForDOM);
  }
}
requestIdleCallback(checkForDOM);
