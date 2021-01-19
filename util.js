const axios = require('axios');
const appDataPath = require('appdata-path')();
const FileStore = require("file-store");
const store = FileStore(appDataPath + "\\id.yb");
const fs = require('fs');
const fsp = fs.promises;

module.exports = {
  appDataPath,
  getParamString(paramObj){
    return Object.keys(paramObj).map(key=>{
      return key+'='+paramObj[key];
    }).join('&');
  },

  getIP(){
    return axios.get("https://lumtest.com/myip.json").then(res=>res.data);
  },

  delay(time){
    return new Promise(resolve=>setTimeout(resolve, time));
  },

  getData(key){
    return new Promise((resolve)=>{
      store.get(key, (err, value)=>{
        if(err){
          resolve();
          return;
        }

        resolve(value);
      });
    })
  },

  setData(key, value){
    return new Promise((resolve)=>{
      store.set(key, value, (err)=>{
        if(err){
          resolve(false);
          return;
        }

        resolve(true);
      });
    })
  },

  removeData(key){
    return new Promise((resolve)=>{
      store.delete(key, (err)=>{
        if(err){
          resolve(false);
          return;
        }

        resolve(true);
      });
    })
  },

  async mkdir(_path){
    try{
      await fsp.access(_path, fs.constants.R_OK | fs.constants.W_OK);
    }catch(e){
      await fsp.mkdir(_path, {recursive:true});
    }
  }
}
