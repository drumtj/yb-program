//const axios = require('axios');
// const {API_BASEURL, EMAIL} = require('./config.js');
function setupAPI(baseURL, email){
  let net = axios.create({
    baseURL: baseURL,
    headers: {
      'Authorization': email
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
    return {
      status: 'fail',
      message: (e.data && e.data.message) ? e.data.message : e.response.statusText
    }
  }

  function ax(url, data, method='GET', headers){
    return net({method, url, data, headers})
    .then(res=>success(res))
    .catch(e=>err(e));
  }

  return {
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
}
