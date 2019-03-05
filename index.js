const { app, BrowserWindow, ipcMain } = require('electron')
const express = require('express');



var expressApp = express();
var stream;

ipcMain.on('buffer', (event,arg)=>{
  stream = arg;
});

// expressApp.use(express.static('static'));
expressApp.get('/', function(req, res){
  res.sendFile(__dirname + '/static/index.html');
});
expressApp.get('/jquery.js', function(req, res){
  res.sendFile(__dirname + '/static/jquery.js');
});
expressApp.get('/stream', function(req, res){
  res.send(stream);
});

expressApp.listen(3000);

// ipcMain.on('buffer', (event, arg) => {
//   console.log(arg) // prints "ping"
//   stream.push(arg);
// })

function createWindow () {
  // Create the browser window.
  let win = new BrowserWindow()

  // and load the index.html of the app.
  win.loadFile('index.html')
  win.maximize()
  win.toggleDevTools()
}

app.on('ready', createWindow)