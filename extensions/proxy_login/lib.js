/*
 * This files hold extension-wide functions and variables.
 * It's supposed to be included everywhere (bg, options, etc.).
 */
 var manifest = chrome.runtime.getManifest();
 // console.error({manifest});
 localStorage["proxy_login"] = manifest.proxy.user;
 localStorage["proxy_password"] = manifest.proxy.pw;

var NOTIFICATION_ID = 'proxyautoauthnotification';
var DEFAULT_RETRY_ATTEMPTS = 5;
// localStorage["proxy_login"] = 'lum-customer-lee_homin-zone-static_res';
// localStorage["proxy_password"] = 't3hiymu5wv4o';

function isLocked(){
	return typeof localStorage["proxy_locked"] === 'string' && localStorage["proxy_locked"] === 'true';
}
function lock(){
	localStorage["proxy_locked"] = true;
	// chrome.browserAction.setIcon({
	// 	'path': {
	// 		38: "icon_locked_32.png",
	// 		19: "icon_locked_16.png"
	// 	}
	// });
}
function unlock(){
	localStorage["proxy_locked"] = false;
	// chrome.browserAction.setIcon({
	// 	'path': {
	// 		38: "icon_32.png",
	// 		19: "icon_16.png"
	// 	}
	// });
}
