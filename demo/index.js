const {app, BrowserWindow, ipcMain, screen} = require('electron');
const path = require("path");
const {PosPrinter} = require("../dist/index");

let mainWin = null;
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS']=true;
app.commandLine.appendSwitch('wm-window-animations-disabled');

var screenSize = null;
const createWindow = () => {
    const win = new BrowserWindow({
        show: true,
//        width: 800, height: 600,
		width: screenSize.width/2, 
		height: screenSize.height/2, 
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false,
            preload: path.join(__dirname, './preload.js')
        }
    })

    win.on('ready-to-show',()=>{
        console.log('ready-to-show');
        win.show();
    });
    
//    win.loadFile('demo.html');
    //win.loadURL('http://localhost/t.html');
    win.loadURL('http://localhost:8100/#test');
    //win.loadURL('http://localhost:8100/#/storelist');	//商户管理
    //win.loadURL('http://localhost:8100/#printerset');	//打印机管理
    //win.loadURL('http://localhost/views/channel/index/index.html#/login');
    //win.loadURL('https://ovo.doudouyou.net/views/channel/index/index.html#/login');
    // ,{
    //     postData: [{
    //       type: 'rawData',
    //       bytes: Buffer.from('hello=world')
    //     }],
    //     extraHeaders: 'Content-Type: application/x-www-form-urlencoded'
    //   }
      
      
    /*
	var paths=['home','appData','userData','sessionData','temp','exe','module','desktop','documents','downloads','music','pictures','videos','recent','logs','crashDumps'];
	paths.forEach((k)=>{
		var p= "";
		try{
			p =  path.dirname(app.getPath(k));
		}
		catch(_){};
		console.log(k+"="+p);		
	})
	*/
	// console.log("appPath="+app.getAppPath());
    return win;
}

app.whenReady().then(() => {
	screenSize = screen.getPrimaryDisplay().size;
//	console.log('screen size:',screenSize);
    mainWin = createWindow();
    try{
        global.sharedObject={"mainWin": mainWin};
        //console.log("sharedObject:"+global.sharedObject);
        global.mainWin = mainWin;
        app.mainWin = mainWin;
    }
    catch(e){
        console.log("exception:"+e);
    }
});


ipcMain.on('open-window', openWindow);
ipcMain.on('printer-print', printerPrint);
ipcMain.on('printer-query-info', printerQueryInfo);
ipcMain.on('printer-preview', printerPreview);

ipcMain.on('log', (event, arg) => {
    console.log("ipcMain log:"+arg);

});

function openWindow(event,url,args) {
//	console.log('req obj=',event);
//	console.log('url='+url);
	//console.log('b='+b);
    const win = new BrowserWindow({
        show: true,
		width: screenSize.width, 
		height: screenSize.height, 
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false,
            preload: path.join(__dirname, './preload.js')
        }
    })
	
    win.on('ready-to-show',()=>{
        console.log('ready-to-show child');
        win.show();
    });
    win.webContents.send('set-session-storage', args);	//send to preload.js

	win.loadURL(url)	
}

async function printerQueryInfo(event){
    console.log("getPrinterList,event=",event);
    const win = event.sender.getOwnerBrowserWindow();
    const list = await win.webContents.getPrintersAsync();
    win.webContents.send('printer-info', list);
    list.forEach((item) => {
        console.log("printer name: ", item.name);
        console.log("display Name: ", item.displayName);
        console.log("description: ", item.description);
        console.log("status: ", item.status);
        console.log("isDefault: ", item.isDefault);    
        if(item.isDefault){
            this.printerName = item.name;
        }
    });
}

function printerPreview(event,content){
    console.log("printPreview, content:",content);  
	doPrint(content, true)
	.then(()=>{console.log('dooooooooone')});
}

function printerPrint(event,content) {
    const win = event.sender.getOwnerBrowserWindow();

    console.log("print, content:", content);  
	doPrint(content, false);
    win.webContents.send('printer-print-result', {'result':true,'msg':'print success'});
}

async function doPrint(content, _preview) {
    const options = {
        preview: _preview,
        // preview: true,				// preview or print
        // preview: false,				// preview or print
        // silent:false,                // silent print
        silent:true,
//        printBackground: true
        width:'286px',                  // 286px = 80mm
        margin: '10px 0px 50px 0px',                 // margin of content body, top right bottom left
        copies: 1,                      // Number of copies to print
        // printerName: 'HP_Laser_NS_MFP_1005w__7F0A08_',		// printerName: string, check with webContent.getPrinters()
        printerName: null,
        timeOutPerLine: 1000,
        pageSize: '80mm',			    // 44mm, 57mm, 58mm, 76mm, 78mm, 80mm
    }

	var ret = false;
    try {
        console.log("begin call print");
        PosPrinter.print(content, options);
//            .then(() => {ret = true; console.log('done, ret='+ret)})
//            .catch((error) => {
//                console.error("error:"+error);
//            });
        
        console.log(_preview?"preview done":"print done, ret="+ret);
    } catch (e) {
        console.log("Exception: "+e);
    }
    return ret;
}

/*
class PrintContent{
    constructor() {
        this.content = [];
    }
    appendText(text, style){
        const t = {
            type: 'text', 
            value: text,
            style: style
        }
        this.content.push(t);
    }
    appendDashLine(){
        const t = {
            type: 'dashLine', 
        }
        this.content.push(t);
    }
    appendQrCode(v,h){
        const t = {
            type: 'qrCode',
            value: v,
            height: h,
            width: h,
            position: 'center'
        }

        this.content.push(t);
    }
}
function prepareData(){
    let headFont1 = {fontWeight: "400", textAlign: 'center', fontSize: "18px"};
    let font2 = {fontSize: "12px"};
    let font3 = {...font2, fontWeight: "bold"};
    let margin10 = {marginTop: '10px', marginBottom: '10px'};

    const t = {
        type: 'table',
        tableHeaderStyle: {color: '#000'},
        tableHeader: [
            {type: 'text', value: '名称', style:{textAlign:"left"}},
            {type: 'text', value: '数量', style:{textAlign:"center"}},
            {type: 'text', value: '价格', style:{textAlign:"right"}}
            ],
        tableBodyStyle: {border: '0px'},
        tableBody: [
            ['鲜汁肉包', {type: 'text', value: 'X1', style:{textAlign:"center"}}, {type: 'text', value: '5.20', style:{textAlign:"right"}}],
            ['老坛酸菜馅饼', {type: 'text', value: 'X2', style:{textAlign:"center"}}, {type: 'text', value: '12.20', style:{textAlign:"right"}}],
            ['韭菜猪肉馅饼', {type: 'text', value: 'X1', style:{textAlign:"center"}}, {type: 'text', value: '6.00', style:{textAlign:"right"}}],
            ['养生馒头', {type: 'text', value: 'X1', style:{textAlign:"center"}}, {type: 'text', value: '3.60', style:{textAlign:"right"}}],
        ],
        tableFooterStyle: {backgroundColor: '#000', color: 'blue'},
    };

    c = new PrintContent();
    c.appendText('取单号：#1', {...headFont1,textAlign: "center"});
    c.appendText('店铺名称(北京大学店)', {...font2, ...margin10,textAlign: "center"});
    c.appendText('--余额支付--', {...headFont1,textAlign: "center"});
    c.appendText('【立即送达】', {...headFont1,textAlign: "center"});
    c.appendText('预计送达时间：立即送出14:27', {...font2,...margin10});
    c.appendDashLine();
    c.appendText('订单编号: 524251426352338684541', font2);
    c.appendText('下单时间: 2023-03-26 12:30:12', font2);
    c.appendText('备注: 千万别放蒜 不能放辣 姜也不能放', font2);
    c.appendDashLine();
    c.content.push(t);
    c.appendDashLine();
    c.appendText('其它费用:', font2);
    c.appendText('[配送费：+5.00]<br>[餐盒费：+2.00]<br>[优惠券优惠：-5.00]<br>[满减优惠：-2.00]', font2);
    c.appendText('实付：￥27.0', {...headFont1, ...margin10,textAlign: "left"});
    c.appendDashLine();
    c.appendText('北京市朝阳区望江西路xxx号xxx大厦xxx号楼xxx层xxx<br>赵先生 135xxxxx123', font3);
    c.appendDashLine();
    c.appendQrCode('https://www.baidu.com',150);
    c.appendText('欢迎下次光临！<br>门店电话：xxxxxxxxxx',  {...font2, textAlign: "center"});

    return c.content;
}
*/