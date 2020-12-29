const axios = require('axios');
const {API_BASEURL, EMAIL} = require('./config.js');
let net = axios.create({
  baseURL: API_BASEURL,
  headers: {
    'Authorization': EMAIL
  }
})

function success(res){
  if(res.data.status == "success"){
    return res.data;
  }else if(res.data.status == "fail"){
    return res.data;
  }else{
    return {
      status: 'fail',
      data: res.data
    }
  }
}

function err(e){
  // console.error(e);
  if(e.response){
    if(e.response.data && e.response.data.status == "fail"){
      return e.response.data;
    }else{
      return {
        status: 'fail',
        message: e.response.statusText
      }
    }
  }else{
    return {
      status: 'fail',
      message: 'empty response'
    }
  }
}

function ax(url, data, method='GET', headers){
  return net({method, url, data, headers})
  .then(res=>success(res))
  .catch(e=>err(e));
}

module.exports = {
  balance(){
    return ax('/balance');
  },

  getPIDs(){
    return ax('/get_pids');
  },

  checkPID(pid){
    return ax('/check_pid/' + pid);
  },

  loadProgram(pid){
    return ax('/load_program/' + pid);
  },

  loadBrowser(bid){
    return ax('/load_browser/' + bid);
  }
}
