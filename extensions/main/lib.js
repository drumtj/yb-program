const HOST_URL = "http://localhost:8080";
const API_BASEURL = "http://175.196.220.135/api";
let EMAIL = null;
let BID = null;
const PN_B365 = "bet365";
const PN_MAIN = "main";
const PN_BG = "bg";
const DEBUG = true;
const MAX_LOG_LENGTH = 1000;

let DATA = {};


// function getIP(){

	// let manifest = chrome.runtime ? chrome.runtime.getManifest() : null;
	// let obj;
	// if(manifest){
	// 	obj = {
	// 		proxy: {
	// 			host: "https://zproxy.lum-superproxy.io",
	// 			port: 22225,
	// 			auth: {
	// 				username: manifest.proxy.user,
	// 				password: manifest.proxy.pw
	// 			}
	// 		}
	// 	}
	// }
	// return axios.get("https://ip.pe.kr", obj).then(res=>{
	// 	try{
	// 		return res.data.match(/<h1[^>]+>([^<]+)<\/h1>/)[1].trim();
	// 	}catch(e){
	// 		return "";
	// 	}
	// })
// }

async function inputWithEvent(selector, value){
	await until(()=>$(selector).length>0);
	eval(`var el = document.querySelector("${selector}");
	if(el){
		var event = new CustomEvent("input");
		el.value = "${value}";
		el.dispatchEvent(event);
	}`)
}

function getUrlParams(url){
	url = url||window.location.href;
	return url.split('?').pop().split('&').reduce((r,v)=>{
		let kv = v.split('=');
		r[kv[0]] = kv[1];
		return r;
	},{})
}

function setData(key, data){
	DATA[key] = data;
}

function getData(key){
	return DATA[key];
}

function removeData(key){
	let d = DATA[key];
	delete DATA[key];
	return d;
}

function addScript(url){
  return new Promise(resolve=>{
    let tag = document.createElement('script');
    Object.assign(tag, {src:url});
    tag.onload = ()=>{
      delete tag.onload;
      resolve();
    }
    document.body.appendChild(tag);
  })
}

function guid() {
  function _s4() {
    return ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
  }
  return _s4() + _s4() + '-' + _s4() + '-' + _s4() + '-' + _s4() + '-' + _s4() + _s4() + _s4();
}

function delay(n){
	return new Promise(resolve=>setTimeout(resolve, n));
}

function findEl(selector, timeout=0){
  return new Promise(resolve=>{
    let dt = Date.now();
		let isArr = Array.isArray(selector);
    function fn(){
      // console.error("findEl", selector);
      let $r, arr;
      if(isArr){
				for(let i=0; i<selector.length; i++){
					$r = $(selector[i]);
          if($r.length){
						resolve($r);
            return;
          }
				}
      }else{
        $r = $(selector);
        if($r.length){
          resolve($r);
          return;
        }
      }

      if(timeout > 0 && Date.now() - dt > timeout){
        resolve(arr || null);
      }else{
        requestIdleCallback(fn);
      }
    }
    fn()
  })
}

function findElAll(selector, timeout=0){
  return new Promise(resolve=>{
    let dt = Date.now();

		if(!Array.isArray(selector)){
			selector = [selector];
		}

    function fn(){
      // console.error("findEl", selector);
      let $r, arr;

			let f = false;
      arr = selector.map(s=>{
        let $s = $(s);
        if($s.length){
					f = true;
          return $s;
        }else{
          return null;
        }
      })
      if(f){
        resolve(arr);
        return;
      }

      if(timeout > 0 && Date.now() - dt > timeout){
        resolve(arr || null);
      }else{
        requestIdleCallback(fn);
      }
    }
    fn()
  })
}

function pause(fn){
	return new Promise(resolve=>{
		if(typeof fn === "function"){
			fn(resolve);
		}
	})
}

function until(findFunc, timeout=0, cancelObj){
  return new Promise(resolve=>{
    let dt = Date.now();
    function fn(){
      if(findFunc()){
        resolve(true);
      }else{
        if(timeout > 0 && Date.now() - dt > timeout){
          resolve(false);
        }else{
          requestIdleCallback(fn);
        }
      }
    }
		if(typeof cancelObj === "object"){
			cancelObj.cancel = function(){
				cancelIdleCallback(fn);
			}
		}
    fn()
  })
}

const calc = {
    stakeB: function (oddA, oddB, stakeA) {
        return oddA / oddB * stakeA;
    },
    investment: function (oddA, oddB, stakeA) {
        return this.stakeB(oddA, oddB, stakeA) + stakeA;
    },
    profit: function (oddA, oddB, stakeA, stakeB) {
			if(stakeB !== undefined){
				return oddA * stakeA - (stakeB + stakeA);
			}
      return oddA * stakeA - this.investment(oddA, oddB, stakeA);
    },
    profitP: function (oddA, oddB) {
        return this.profit(oddA, oddB, 1) / this.investment(oddA, oddB, 1);
    }
};
