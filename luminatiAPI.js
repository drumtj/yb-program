const axios = require('axios');
// const {
//   // PROXY_ZONE_NAME, PROXY_ZONE_PASSWORD, PROXY_ZONE,
//   PROXY_API_TOKEN, PROXY_CUSTOMER
// } = require('./config.js');

// class LAPI {
//   constructor(){
//
//   }
// }

module.exports = (customer, token)=>{
  let net = axios.create({
    baseURL: 'https://luminati.io/api',
    headers: {
      'Authorization': `Bearer ${token}`
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

  return {
    balance(){
      // return ax(`customer/balance?customer=${PROXY_CUSTOMER}`);
      return ax('/customer/balance', {
        customer: customer
      });
    },

    addIP(zone, ip){
      return ax('/zone/whitelist', {
        customer: customer,
        // zone: PROXY_ZONE,
        zone,
        ip
      }, 'POST');
    },

    removeIP(zone, ip){
      return ax('/zone/whitelist', {
        customer: customer,
        // zone: PROXY_ZONE,
        zone,
        ip
      }, 'DELETE');
    },

    getIPs(zones){
      return ax('/zone/whitelist', {
        customer: customer,
        // zones: PROXY_ZONE
        zones
      }, 'GET'
      // , {
      //   'X-Lum-Auth': `lum-customer-${PROXY_CUSTOMER}-zone-${PROXY_ZONE_NAME}-key-${PROXY_ZONE_PASSWORD}`
      // }
      );
    },
  }
}
