const ffi = require('ffi-napi');
// const ref = require('ref-napi');

// var voidPtr = ref.refType(ref.types.void);
// var stringPtr = ref.refType(ref.types.CString);

// var lpctstr = {
//     name: 'lpctstr',
//     indirection: 1,
//     size: ref.sizeof.pointer,
//     get: function(buffer, offset) {
//         var _buf = buffer.readPointer(offset);
//         if(_buf.isNull()) {
//             return null;
//         }
//         return _buf.readCString(0);
//     },
//     set: function(buffer, offset, value) {
//         var _buf = new Buffer(Buffer.byteLength(value, 'ucs2') + 2)
//         _buf.write(value, 'ucs2')
//         _buf[_buf.length - 2] = 0
//         _buf[_buf.length - 1] = 0
//         return buffer.writePointer(_buf, offset)
//     },
//     ffi_type: ffi.types.CString.ffi_type
// }

// console.log(ffi.types);

const user32 = new ffi.Library('user32', {
    'GetTopWindow': ['long', ['long']],
    'FindWindowA': ['long', ['string', 'string']],
    'SetActiveWindow': ['long', ['long']],
    'SetForegroundWindow': ['bool', ['long']],
    'BringWindowToTop': ['bool', ['long']],
    'ShowWindow': ['bool', ['long', 'int']],
    'SwitchToThisWindow': ['void', ['long', 'bool']],
    'GetForegroundWindow': ['long', []],
    'AttachThreadInput': ['bool', ['int', 'long', 'bool']],
    'GetWindowThreadProcessId': ['int', ['long', 'int']],
    'SetWindowPos': ['bool', ['long', 'long', 'int', 'int', 'int', 'int', 'uint']],
    'SetFocus': ['long', ['long']],
    // 'EnumWindows': ['bool', ['void *', 'int32']],
    // 'GetWindowTextA' : ['long', ['long', 'char *', 'long']]
});

const kernel32 = new ffi.Library('Kernel32.dll', {
    'GetCurrentThreadId': ['int', []]
});

module.exports = {
  FindWindowA(programName){
    return user32.FindWindowA(null, programName);
  },

  GetForegroundWindow(){
    return user32.GetForegroundWindow();
  },

  GetCurrentThreadId(){
    return kernel32.GetCurrentThreadId();
  },

  GetWindowThreadProcessId(hwnd){
    return user32.GetWindowThreadProcessId(hwnd, null);
  },

  ShowWindow(winToSetOnTop){
    return user32.ShowWindow(winToSetOnTop, 9);
  },

  SetWindowPos(winToSetOnTop){
    return user32.SetWindowPos(winToSetOnTop, -1, 0, 0, 0, 0, 3);
  },

  SetWindowPos(winToSetOnTop){
    return user32.SetWindowPos(winToSetOnTop, -2, 0, 0, 0, 0, 3);
  },

  SetForegroundWindow(winToSetOnTop){
    return user32.SetForegroundWindow(winToSetOnTop);
  },

  AttachThreadInput(windowThreadProcessId, currentThreadId){
    return user32.AttachThreadInput(windowThreadProcessId, currentThreadId, 0);
  },

  SetFocus(winToSetOnTop){
    return user32.SetFocus(winToSetOnTop);
  },

  SetActiveWindow(winToSetOnTop){
    return user32.SetActiveWindow(winToSetOnTop);
  },

  BringWindowToTop(winToSetOnTop){
    return user32.BringWindowToTop(winToSetOnTop);
  }

  // EnumWindows(pid, lParam){
  //   return user32.EnumWindows(pid, lParam);
  // }
}
