const axios = require('axios');
const {PROXY_ZONE_NAME, PROXY_ZONE_PASSWORD, PROXY_ZONE, PROXY_API_TOKEN, PROXY_CUSTOMER} = require('./config.js');
let net = axios.create({
  baseURL: 'https://luminati.io/api',
  headers: {
    'Authorization': `Bearer ${PROXY_API_TOKEN}`
  }
})

function success(res){
  return {
    status: 'success',
    data: res.data
  }
}

function err(e){
  return {
    status: 'fail',
    message: e.response.statusText
  }
}

function ax(url, data, method='GET', headers){
  return net({method, url, data, headers})
  .then(res=>success(res))
  .catch(e=>err(e));
}

module.exports = {
  balance(){
    // return ax(`customer/balance?customer=${PROXY_CUSTOMER}`);
    return ax('/customer/balance', {
      customer: PROXY_CUSTOMER
    });
  },

  addIP(ip){
    return ax('/zone/whitelist', {
      customer: PROXY_CUSTOMER,
      zone: PROXY_ZONE,
      ip
    }, 'POST');
  },

  removeIP(ip){
    return ax('/zone/whitelist', {
      customer: PROXY_CUSTOMER,
      zones: PROXY_ZONE,
      ip
    }, 'DELETE');
  },

  getIPs(){
    return ax('/zone/whitelist', {
      customer: PROXY_CUSTOMER,
      zone: PROXY_ZONE
    }, 'GET', {
      'X-Lum-Auth': `lum-customer-${PROXY_CUSTOMER}-zone-${PROXY_ZONE_NAME}-key-${PROXY_ZONE_PASSWORD}`
    });
  },
}
