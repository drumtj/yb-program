const napi = require("./napi");
console.log(napi.FindWindowA("Telegram"));
console.log(napi.FindWindowA("Chromium"));

let a = napi.FindWindowA("Chromium");
// console.log();
napi.BringWindowToTop(a);
