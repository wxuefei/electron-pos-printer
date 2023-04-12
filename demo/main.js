const {app, BrowserWindow, ipcMain, screen} = require('electron');
const path = require("path");


process.env['ELECTRON_DISABLE_SECURITY_WARNINGS']=true;
const createWindow = () => {
    const size = screen.getPrimaryDisplay().size;
    console.log('screen size:',size);
    const win = new BrowserWindow({
        show: true,
//        width: 800, height: 600,
		width: size.width, 
		height: size.height, 
		showDevTools:true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    })
	console.log("appPath="+app.getAppPath());
    win.loadURL('http://localhost/t.html');
}

app.whenReady().then(() => {
    createWindow();
});

