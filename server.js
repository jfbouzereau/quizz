var fs = require("fs");
var https = require("https");
var express = require("express");
var WebSocketServer = require("ws").Server;
var spawn = require("child_process").spawn;

const port = 8000;

const options = {
  key: fs.readFileSync('../privkey.pem'),
  cert: fs.readFileSync('../cert.pem'),
  ca: fs.readFileSync('../chain.pem')
};

var app = express();
var server = https.createServer(options,app);
var wss = new WebSocketServer( {server:server} );

var cndesktop = null;
var cnmobiles = [];

var playerid = 0;

//********************************************************

app.use(function (req, res, next) {
	var d = (new Date())+"";
	d = d.replace(/GMT.*/,"");
  console.log(d+"\t"+req.connection.remoteAddress+"\t"+req.url);
  next();
});

app.get("/",init);

app.get("/getstate", function(req,res) {
	res.send(cndesktop?"Busy":"Free");
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

function init(req,res) {


	if(req.url.indexOf("desktop")>=0)
		res.sendFile("desktop.html",{root:"static"});
	else 
		res.sendFile("mobile.html",{root:"static"});
}

//********************************************************

wss.on("connection", function(cn, req) {
	
    start_connection(cn);

    cn.on("message", function(data) {
        var msg = JSON.parse(data);
	console.log("MESSAGE "+data);
		
        switch(msg.type) {
	case "desktop":

		broadcast_mobiles({type:"close"});

		cndesktop = cn;
		cnmobiles = [];
		forward_desktop({type:"gid",value:0});
		break;

	case "mobile":
		if(!cndesktop)  {
			var reply = {type:"error",value:"nogame"};
			try {cn.send(JSON.stringify(reply));} catch(err){};
			return;
		}

		cnmobiles.push(cn);

		playerid++;
		cn.pid = playerid;
		console.log("CN.PID = "+cn.pid);
		forward_desktop({type:"mobile",pid:cn.pid});
		break;

	case "welcome":
		forward_mobile(msg);
		break;

	case "user":
		msg.pid = cn.pid;
		forward_desktop(msg);
		break;

	case "question":
		broadcast_mobiles(msg);
		break;

	case "answer":
		msg.pid = cn.pid;
		forward_desktop(msg);
		break;

	case "retry" :
		msg.type = "question";
		forward_mobile(msg);
		break;

	case "status":
		forward_mobile(msg);
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

	if(cndesktop && cndesktop==this) {
		console.log("REMOVING DESKTOP ");
		broadcast_mobiles({type:"close"});
		cndesktop = null;
	} 
	else if(cnmobiles) {		
		/*
		for(var i=0;i<cnmobiles.length;i++)
			if(cnmobiles[i]==this) {
				console.log("REMOVING MOBILE "+i);
				cnmobiles.splice(i,1);
			}
		*/
	}

}

//********************************************************

function forward_desktop(msg) {
	if(cndesktop)
	try { cndesktop.send(JSON.stringify(msg)); }
	catch(err) {}
}

//********************************************************

function forward_mobile(msg) {
	if(!cnmobiles) return;
	for(var i=0;i<cnmobiles.length;i++)
		if(cnmobiles[i].pid==msg.pid)
			try { cnmobiles[i].send(JSON.stringify(msg)); }
			catch(err) { console.log(err); }
}

//********************************************************

function broadcast_mobiles(msg) {
	if(!cnmobiles) return;

	var index = -1;
	f();

	function f() {
		index++;
		if(index>=cnmobiles.length) return;
		var cn = cnmobiles[index];
		try { cn.send(JSON.stringify(msg)); }
		catch(err) { console.log(err); }		
		setTimeout(f,50);
	}

}

//********************************************************

function terminate() {

	forward_desktop({type:"close"});	

	broadcast_mobiles({type:"close"});

	process.exit(0);
}

//********************************************************

