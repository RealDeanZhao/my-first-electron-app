var app = require('app');
var ipc = require('ipc');
var BrowserWindow = require('browser-window');
var http = require('http');
var mainWindow = null;
var request = require('request');
var ipc = require('ipc');
app.on('ready', function () {
	mainWindow = new BrowserWindow({
		width: 800,
		height: 600
	});
	mainWindow.loadUrl('file://' + __dirname + '/main.html');
	//mainWindow.openDevTools();

	ipc.on('new-balance-history', function (event) {
		mainWindow.setProgressBar(1);
	});
	ipc.on('no-balance-history', function (events) {
		mainWindow.setProgressBar(0.5);
	});
	mainWindow.on('focus', function () {
		mainWindow.setProgressBar(0);
	})

	mainWindow.webContents.on('new-window', function (e, url) {
		e.preventDefault();
		require('shell').openExternal(url);
	});
});

app.on('closed', function () {
	mainWindow = null;
});


