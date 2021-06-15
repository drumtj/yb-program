// let domain = "www.surebet.vip";
let domain = "158.247.214.242";

// dev
// domain = "1.235.111.130";


module.exports = {
  // PROXY_SERVER: 'zproxy.lum-superproxy.io:22225',
  // PROXY_CUSTOMER : 'lee_homin',
  // PROXY_API_TOKEN : '116f9b6896dc62613f22fc0819aeaffb',
  // PROXY_ZONE_NAME : 'lum-customer-lee_homin-zone-static_res',
  // PROXY_ZONE_PASSWORD : 't3hiymu5wv4o',
  // PROXY_ZONE: 'static_res',
  // SOCKET_URL: 'ws://175.196.220.135',
  // HOST_URL: 'http://175.196.220.135',
  // API_BASEURL: 'http://175.196.220.135/api',

  // SOCKET_URL: 'ws://158.247.221.211',
  // HOST_URL: 'http://158.247.221.211',
  // API_BASEURL: 'http://158.247.221.211/api',

  VERSION: 2,

  SOCKET_URL: `ws://${domain}`,
  HOST_URL: `http://${domain}`,
  API_BASEURL: `http://${domain}/api`,

  LOCAL_MAIN_URL: 'http://localhost:8080/main.html',
  // BROWSER_SYNC_CONTROL: false,
  // BLOCK_RESOURCE: false,
  USE_PROXY: true
}
