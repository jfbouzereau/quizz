
var http = require("http");
var express = require("express");
var WebSocketServer = require("ws").Server;
var spawn = require("child_process").spawn;

const port = 8000;

var app = express();
var server = http.createServer(app);
var wss = new WebSocketServer( {server:server} );

var cndesktop = null;
var cnmobiles = [];
var cnid = 0;


//********************************************************

app.get("/", function(req,res) {
	var ua = req.headers["user-agent"];	
	var mobile = !!ua.match(/(Android)|(iPhone)|(iPad)/);

	if(mobile)
		res.sendFile("mobile.html",{root:"static"});
	else
		res.sendFile("desktop.html",{root:"static"});
});

app.get("/:filename", function(req,res) {
	res.sendFile(req.params.filename,{root:"static"});
});

app.get("/:dir/:filename", function(req,res) {
	res.sendFile(req.params.dir+"/"+req.params.filename,{root:"static"});
});

console.log("Listening on port "+port);
server.listen(port);

process.on("SIGINT", terminate);

//********************************************************

wss.on("connection", function(cn) {
	
    start_connection(cn);

    cn.on("message", function(data) {
        var msg = JSON.parse(data);
		console.log("MESSAGE "+data);
        switch(msg.type) {
			case "desktop":
				cndesktop = cn;
				// close all mobiles already connected
				broadcast({type:"close"});
				cnmobiles = [];
				break;

			case "mobile":
				cn.id = ++cnid;
				cnmobiles.push(cn);

				msg.id = cn.id;
				forward_desktop(msg);
				break;

			case "welcome":
				forward_mobile(msg);
				break;

            case "user":
				msg.id = cn.id;
				forward_desktop(msg);
				break;

			case "question":
				broadcast(msg);
				break;

			case "answer":
				msg.id = cn.id;
				forward_desktop(msg);
				break;

			case "status":
				forward_mobile(msg);
				break;
            }
        });

    cn.on("close", close_connection);
    });

function start_connection(cn) {
	// nothing so far
}

function close_connection() {
}

function forward_desktop(msg) {
	if(cndesktop)
		try { cndesktop.send(JSON.stringify(msg)); }
		catch(err) {}
}

function forward_mobile(msg) {
	for(var i=0;i<cnmobiles.length;i++)
		if(cnmobiles[i].id==msg.id)
			try { cnmobiles[i].send(JSON.stringify(msg)); }
			catch(err) {}
}

function broadcast(msg) {
	for(var i=0;i<cnmobiles.length;i++)
		try { cnmobiles[i].send(JSON.stringify(msg)); }
		catch(err) {}
}

function terminate() {
	forward_desktop({type:"close"});	
	broadcast({type:"close"});
	process.exit(0);
}


