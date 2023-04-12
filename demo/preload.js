console.log('preload.js');
var ipcRenderer = require('electron').ipcRenderer;
console.log('preload:ipcRenderer',ipcRenderer);

window.ipcRenderer = ipcRenderer;

ipcRenderer.on('set-session-storage',(event,args)=>{
	for(k in args){
		sessionStorage.setItem(k, args[k]);
	}
})
