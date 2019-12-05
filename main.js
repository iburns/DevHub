// Modules to control application life and create native browser window
const {app, screen, BrowserWindow, globalShortcut, ipcMain} = require('electron')
const path = require('path')
const fs = require('fs');
const Store = require('./js/store.js');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    resizable: false,
    movable: false,
    fullscreen: true,
    simpleFullscreen: true,
    show: false,
    frame: false,
    transparent: true,
    vibrancy: "underpage",
    webPreferences: {
      nodeIntegration: true
    }
  })

  mainWindow.webContents.openDevTools();

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  mainWindow.on('ready-to-show', function() { 
    showMain();
  });
}

function showMain() {
  app.dock.hide();
  mainWindow.show(); 
  mainWindow.focus(); 
  mainWindow.setAlwaysOnTop(true, "screen-saver");
  mainWindow.setVisibleOnAllWorkspaces(true);
  mainWindow.fullScreenable = false;
  app.dock.show()
}

function hideMain() {
  mainWindow.setAlwaysOnTop(false);
  mainWindow.hide();
  app.hide();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function() {
  // Register a 'CommandOrControl+Shift+D' shortcut listener.
  const ret = globalShortcut.register('CommandOrControl+Shift+D', () => {
    if (!mainWindow.isVisible()) {
      showMain();
    } else {
      hideMain();
    }
  })

  if (!ret) {
    console.log('registration failed')
  }

  setTimeout(() => {
    // create main window
    createWindow();
  }, 10);
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

app.on('will-quit', () => {
  // Unregister a shortcut.
  globalShortcut.unregister('CommandOrControl+X')

  // Unregister all shortcuts.
  globalShortcut.unregisterAll()
});

const store = new Store({
  // We'll call our data file 'user-preferences'
  configName: 'board1',
  defaults: {
    title: "Title",
    text: "Enter text..."
  }
});

ipcMain.on('save-note', (event, arg) => {
  console.log('to save');
  console.log(arg);

  store.set('text', arg.text)
  store.set('title', arg.title)
  event.returnValue = 'boop';
});

ipcMain.on('load-note', (event, arg) => {
  var title = store.get('title')
  var txt = store.get('text')
  console.log(title);
  console.log(txt);
  event.returnValue = { text: txt,
    title: title
  }
});
