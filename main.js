// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu } = require('electron');
var path = require('path')
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    // width: 1024,
    // height: 768,
    minWidth: 1000,
    minHeight: 600,
    titleBarStyle: "default",
    // backgroundColor: '#312450',
    show: false,
    icon: path.join(__dirname, 'src/img/icon.png'),
    webPreferences: {
      nodeIntegration: true
    }
  })

  var menu = Menu.buildFromTemplate([
    {
      label: 'Menu',
      submenu: [
        {
          label: 'Exit',
          click() {
            app.quit()
          },
          accelerator: 'CmdOrCtrl+Q'
        }
      ]
    }
  ])
  Menu.setApplicationMenu(menu)

  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize()
    mainWindow.show()
  })

  // mainWindow.setMenuBarVisibility(false)


  // and load the index.html of the app.
  mainWindow.loadFile('./src/home.html')

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  var python = require('child_process').spawn('python', ['./src/res/mpt.py']);
  python.stdout.on('data', function (data) {
    console.log("data: ", data.toString('utf8'));
  });
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  // if (process.platform !== 'darwin') app.quit()
  app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

