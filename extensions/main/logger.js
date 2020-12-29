function log(msg, type){
	if(DEBUG){
		console.log('[debug]', msg);
	}
	this.sendData("log", {msg, type}, PN_MAIN, true);
}

log.setSendFunc = fn=>{
  this.sendData = fn;
}

log.error = function(msg){
	if(DEBUG){
		console.error('[debug]', msg);
	}
	this.sendData("log", {msg, type:"danger"}, PN_MAIN, true);
}
log.warning = function(msg){
	this(msg, 'warning');
}
log.info = function(msg){
	this(msg, 'info');
}
log.danger = function(msg){
	this(msg, 'danger');
}
log.success = function(msg){
	this(msg, 'success');
}
log.primary = function(msg){
	this(msg, 'primary');
}
