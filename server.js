
var http = require("http");
var express = require("express");
var WebSocketServer = require("ws").Server;
var spawn = require("child_process").spawn;

const port = 8000;

var app = express();
var server = http.createServer(app);
var wss = new WebSocketServer( {server:server} );

var cndesktop = {};
var cnmobiles = {};
var playerid = 0;


//********************************************************

app.get("/",init);

app.get("/:gid([a-z][a-z][a-z])", init);

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

function init(req,res) {

	var ua = req.headers["user-agent"];	
	var mobile = !!ua.match(/(Android)|(iPhone)|(iPad)/);

	if(req.url.indexOf("desktop")>=0)
		res.sendFile("desktop.html",{root:"static"});
	else if(req.url.indexOf("mobile")>=0)
		res.sendFile("mobile.html",{root:"static"});
	else if(mobile)
		res.sendFile("mobile.html",{root:"static"});
	else
		res.sendFile("desktop.html",{root:"static"});
}

//********************************************************

wss.on("connection", function(cn) {
	
    start_connection(cn);

    cn.on("message", function(data) {
        var msg = JSON.parse(data);
		console.log("MESSAGE "+data);
		
        switch(msg.type) {
			case "desktop":
				var gid = random_gid();	// game id
				cn.gid = gid;
				cndesktop[gid] = cn;
				cnmobiles[gid] = [];
				forward_desktop(gid,{type:"gid",value:gid});
				break;

			case "mobile":
				if(!msg.gid) break;
				var gid = msg.gid;
				if(!cndesktop[gid]) break;
				if(!cnmobiles[gid]) break;
				cnmobiles[gid].push(cn);

				cn.gid = gid;
				cn.pid = ++playerid;
				forward_desktop(gid,{type:"mobile",pid:cn.pid});
				break;

			case "welcome":
				forward_mobile(cn.gid,msg);
				break;

            case "user":
				msg.pid = cn.pid;
				forward_desktop(cn.gid,msg);
				break;

			case "question":
				broadcast_mobiles(cn.gid,msg);
				break;

			case "answer":
				msg.pid = cn.pid;
				forward_desktop(cn.gid,msg);
				break;

			case "status":
				forward_mobile(cn.gid,msg);
				break;
            }
        });

    cn.on("close", close_connection);
    });

//********************************************************

function start_connection(cn) {
	// nothing so far
}

//********************************************************

function close_connection() {

	var gid = this.gid;
	if(cndesktop[gid] && cndesktop[gid]==this) {
		console.log("REMOVING DESKTOP "+gid);
		broadcast_mobiles(gid,{type:"close"});
		delete cndesktop[gid];
	} 
	else if(cnmobiles[gid]) {
		for(var i=0;i<cnmobiles[gid].length;i++)
			if(cnmobiles[gid][i]==this) {
				console.log("REMOVING MOBILE "+gid+" "+i);
				cnmobiles[gid].splice(i,1);
			}
	}

}

//********************************************************

function forward_desktop(gid,msg) {
	if(cndesktop[gid])
		try { cndesktop[gid].send(JSON.stringify(msg)); }
		catch(err) {}
}

//********************************************************

function forward_mobile(gid,msg) {
	if(!cnmobiles[gid]) return;
	for(var i=0;i<cnmobiles[gid].length;i++)
		if(cnmobiles[gid][i].pid==msg.pid)
			try { cnmobiles[gid][i].send(JSON.stringify(msg)); }
			catch(err) {}
}

//********************************************************

function broadcast_mobiles(gid,msg) {
	if(cnmobiles[gid])
		for(var i=0;i<cnmobiles[gid].length;i++)
			try { cnmobiles[gid][i].send(JSON.stringify(msg)); }
			catch(err) {}
}

//********************************************************

function terminate() {

	for(var gid in cndesktop) 
		forward_desktop(gid,{type:"close"});	

	for(var gid in cnmobiles)
		broadcast_mobiles(gid,{type:"close"});

	process.exit(0);
}

//********************************************************

function random_gid() {
	const alphabet = "abcdefghijklmnopqrstuvwxyz";
	var gid = "";
	for(var i=0;i<3;i++)
		gid += alphabet[(Math.random()*alphabet.length)|0];
	return gid;
}

//********************************************************

	

