const HOST_URL = "http://localhost:8080";
const API_BASEURL = "http://localhost:4500/api";
let EMAIL = null;
let BID = null;
const PN_B365 = "bet365";
const PN_MAIN = "main";
const PN_BG = "bg";
const DEBUG = true;
const MAX_LOG_LENGTH = 1000;

let DATA = {};

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

			let f = true;
      arr = selector.map(s=>{
        let $s = $(s);
        if($s.length){
          return $s;
        }else{
					f = false;
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

function until(findFunc, timeout=0){
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
    fn()
  })
}
