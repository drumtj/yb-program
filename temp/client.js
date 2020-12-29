const { Worker } = require('worker_threads');

class Client {
  ready;
  worker;
  sendResolve = {};
  option;
  onClickBroadcast;
  onInputBroadcast;
  constructor(opt){
    this.option = opt;
    this.ready = new Promise(resolve=>{
      this.worker = new Worker(require.resolve("./worker.js"), {
        workerData: opt
      });
      this.worker.on('message', this.onMessage.bind(this));
    })
  }

  async onMessage(message){
    let {com, data, key} = message;

    if(key){
      if(this.sendResolve[key]){
        this.sendResolve[key](data);
        delete this.sendResolve[key];
      }
      return;
    }


    switch(com){
      case "receiveData":
        if(typeof this.onReceiveData === "function"){
          this.onReceiveData(data.com, data.data);
        }
      break;

      case "clickBroadcast":
        if(typeof this.onClickBroadcast === "function"){
          // console.error('receive clickBroadcast', data);
          this.onClickBroadcast(data);
        }
      break;

      case "inputBroadcast":
        if(typeof this.onInputBroadcast === "function"){
          this.onInputBroadcast(data);
        }
      break;

      // case "changeBroadcast":
      //   if(typeof this.onChangeBroadcast === "function"){
      //     this.onClickBroadcast(data);
      //   }
      // break;
    }
  }

  dispose(){
    return this.send("dispose");
  }

  type(selector, value){
    return this.send("type", {selector, value});
  }

  char(value){
    return this.send("char", value);
  }

  click(pos){
    return this.send("click", pos);
  }

  genKey(){
    return 'k' + Math.floor(Date.now()%100000) + Math.round(Math.random()*100000);
  }

  send(com, data, promise=true){
    let key;
    if(promise){
      key = this.genKey();
    }
    return new Promise(resolve=>{
      if(promise){
        this.sendResolve[key] = resolve;
      }
      this.worker.postMessage({com, data, key});
    })
  }

  goto(url){
    return this.send('goto', url);
  }

  pinnacle(url){
    return this.send('pinnacle', url);
  }
}

module.exports = Client;
