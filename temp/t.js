const fs = require("fs");
const {execSync} = require('child_process');
// var size = require('window-size');
// console.log(size.get());
// console.log(size.env());
// console.log(size.win());

function getScreenSize(){
  var cmd = 'wmic path Win32_VideoController get CurrentHorizontalResolution,CurrentVerticalResolution';
  try{
    var t = execSync(cmd).toString().match(/\d+/g).map(parseFloat);
    if(t){
      return {
        width: t[0],
        height: t[1]
      }
    }
  }catch(e){
    return;
  }
}

console.log(getScreenSize());

// typescript
// const { execSync } = require("child_process");

 // try {
 //    // const cmd = 'git rev-parse --is-inside-work-tree';
 //    console.log(execSync(cmd).toString());
 // } catch (error) {
 //    // error.status;  // 0 : successful exit, but here in exception it has to be greater than 0
 //    // error.message; // Holds the message you typically want.
 //    // error.stderr;  // Holds the stderr output. Use `.toString()`.
 //    // error.stdout;  // Holds the stdout output. Use `.toString()`.
 //    console.error(error.message);
 // }
