const {app, BrowserWindow, ipcMain, screen} = require('electron');
const path = require("path");
const {PosPrinter} = require("../dist/index");


process.env['ELECTRON_DISABLE_SECURITY_WARNINGS']=true;
const createWindow = () => {
    const size = screen.getPrimaryDisplay().size;
    console.log(size);
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })

    win.loadFile('demo.html');
    // open deve tools
    //win.webContents.openDevTools();
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
	console.log("appPath="+app.getAppPath());
}

app.whenReady().then(() => {
    createWindow();
});

ipcMain.on('test-print', testPrint);
ipcMain.on('preview-print', previewPrint);

function previewPrint(){
	doPrint(true);
}

function testPrint() {
	doPrint(false);
}
function doPrint(_preview) {
    const options = {
        preview: _preview,
//        preview: true,				//  preview or print
//        preview: false,				//  preview or print
        margin: 'auto',				// margin of content body
        copies: 1,					// Number of copies to print
        printerName: 'HP_Laser_NS_MFP_1005w__7F0A08_',		// printerName: string, check with webContent.getPrinters()
        timeOutPerLine: 1000,
        pageSize: '80mm',			// page size, 44mm, 57mm, 58mm, 76mm, 78mm, 80mm

        silent:true,
//        printBackground: true
    }
	const appPath = app.getAppPath();
    const data = [
        {
            type: 'table',
            style: {border: '1px solid #ddd'},             // style the table
            // list of the columns to be rendered in the table header
            tableHeader: [{type: 'text', value: 'People'}, {
                type: 'image',
                url: appPath+'/images/13.jpg'
            }],
            // multidimensional array depicting the rows and columns of the table body
            tableBody: [
                [{type: 'text', value: 'Marcus'}, {
                    type: 'image',
                    url: appPath+'/images/43.jpg'
                }],
                [{type: 'text', value: 'Boris'}, {
                    type: 'image',
                    url: appPath+'/images/41.jpg'
                }],
                [{type: 'text', value: 'Andrew'}, {
                    type: 'image',
                    url: appPath+'/images/23.jpg'
                }],
                [{type: 'text', value: 'Tyresse'}, {
                    type: 'image',
                    url: appPath+'/images/53.jpg'
                }],
            ],
            // list of columns to be rendered in the table footer
            tableFooter: [{type: 'text', value: 'People'}, 'Image'],
            // custom style for the table header
            tableHeaderStyle: {backgroundColor: 'red', color: 'white'},
            // custom style for the table body
            tableBodyStyle: {'border': '0.5px solid #ddd'},
            // custom style for the table footer
            tableFooterStyle: {backgroundColor: '#000', color: 'white'},
        },
        {
            type: 'image',
            url: appPath+'/images/43.jpg',     // file path
            position: 'center',                                  // position of image: 'left' | 'center' | 'right'
            width: '60px',                                           // width of image in px; default: auto
            height: '60px',
        },
        {
            type: 'text',                                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
            value: 'SAMPLE HEADING',
            style: {fontWeight: "700", textAlign: 'center', fontSize: "24px"}
        },
        {
            type: 'text',                       // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
            value: 'Secondary text',
            style: {textDecoration: "underline", fontSize: "10px", textAlign: "center", color: "red"}
        },
        {
            type: 'barCode',
            value: '023456789010',
            height: 40,                     // height of barcode, applicable only to bar and QR codes
            width: 2,                       // width of barcode, applicable only to bar and QR codes
            displayValue: true,             // Display value below barcode
            fontsize: 12,
        },
        {
            type: 'qrCode',
            value: 'https://github.com/Hubertformin/electron-pos-printer',
            height: 55,
            width: 55,
            position: 'right'
        },
        {
            type: 'table',
            // style the table
            style: {border: '1px solid #ddd'},
            // list of the columns to be rendered in the table header
            tableHeader: ['Animal', 'Age'],
            // multidimensional array depicting the rows and columns of the table body
            tableBody: [
                ['Cat', 2],
                ['Dog', 4],
                ['Horse', 12],
                ['Pig', 4],
            ],
            // list of columns to be rendered in the table footer
            tableFooter: ['Animal', 'Age'],
            // custom style for the table header
            tableHeaderStyle: {backgroundColor: '#000', color: 'white'},
            // custom style for the table body
            tableBodyStyle: {'border': '0.5px solid #ddd'},
            // custom style for the table footer
            tableFooterStyle: {backgroundColor: '#000', color: 'white'},
        }
    ]

    try {
        PosPrinter.print(data, options)
            .then(() => console.log('done'))
            .catch((error) => {
                console.error("error:"+error);
            });
        console.log("print done");
    } catch (e) {
        console.log(PosPrinter)
        console.log("Exception: "+e);
    }
}