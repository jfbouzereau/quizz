var http = require("http");
var express = require("express");
var bodyParser = require("body-parser");

const port = 8000;

var app = express();
var server = http.createServer(app);

var desktopmsg = {}; 		// waiting messages for desktop
var desktopres = {};		// waiting responses for desktop
var mobilemsg = {};			// waiting messages for mobile
var mobileres = {};			// waiting responses for mobile

var playerid = 0;

var debug = false;

//********************************************************

app.use(bodyParser.json());

//app.use(reqlog);

// normal start of desktop
app.get("/",init);

// normal start of mobile with game id
app.get("/:gid([a-z][a-z][a-z])", init);

app.get("/_desktop_/:gid",ondesktop);		// desktop polling

app.get("/_mobile_/:gid/:pid",onmobile);	// mobile polling

app.get("/:filename", function(req,res) {
	res.sendFile(req.params.filename,{root:"static"});
});

app.get("/:dir/:filename", function(req,res) {
	res.sendFile(req.params.dir+"/"+req.params.filename,{root:"static"});
});

app.post("/msg", onmessage);

log("Listening on port "+port);
server.listen(port);

cleanup();
setInterval(cleanup,300000);

//********************************************************

function reqlog(req,res,next) {
	
	log("REQ "+req.url);

	next();
}

//********************************************************

function init(req,res) {

	var ua = req.headers["user-agent"];	
	var mobile = !!ua.match(/(Android)|(iPhone)|(iPad)/);

	if(req.url.indexOf("desktop")>=0)
		res.sendFile("desktop2.html",{root:"static"});
	else if(req.url.indexOf("mobile")>=0)
		res.sendFile("mobile2.html",{root:"static"});
	else if(mobile)
		res.sendFile("mobile2.html",{root:"static"});
	else
		res.sendFile("desktop2.html",{root:"static"});
}

//********************************************************

function ondesktop(req,res) {

	var gid = req.params.gid;

	log("DESKTOP POLLING GID "+gid);

	if(desktopmsg[gid]&&(desktopmsg[gid].length>0)) {
		var msg = desktopmsg[gid].shift();
		log("    FOUND MSG "+JSON.stringify(msg));
		res.json(msg);
	}
	else {
		log("    PUSHING RES");
		if(!desktopres[gid])
			desktopres[gid] = [];
		res.__time = Date.now();
		desktopres[gid].push(res);
	}

}

//********************************************************

function onmobile(req,res) {

	var gid = req.params.gid;
	var pid = req.params.pid;
	var key = gid+"/"+pid;

	log("MOBILE POLLING KEY "+key);

	if(mobilemsg[key]&&(mobilemsg[key].length>0)) {
		var msg = mobilemsg[key].shift();
		log("    FOUND MSG "+JSON.stringify(msg));
		res.json(msg);
	}
	else {
		log("    PUSHING RES "+key);
		if(!mobileres[key])
			mobileres[key] = [];
		res.__time = Date.now();
		mobileres[key].push(res);
	}

}

//********************************************************

function send_desktop(msg) {

	var gid = msg.gid;

	log("SEND TO DESKTOP GID "+gid+" "+JSON.stringify(msg));

	if(desktopres[gid]&&(desktopres[gid].length>0)) {
		log("    FOUND RES");
		var res = desktopres[gid].shift();
		res.json(msg);
	}
	else {
		log("    PUSHING MSG");
		if(!desktopmsg[gid])
			desktopmsg[gid] = [];
		msg.__time = Date.now();
		desktopmsg[gid].push(msg);
	}
}

//********************************************************

function send_mobile(msg) {
		
	var gid = msg.gid;
	var pid = msg.pid;
	var key = gid+"/"+pid;

	log("SEND TO MOBILE "+key+" "+JSON.stringify(msg));

	if(mobileres[key]&&(mobileres[key].length>0)) {
		log("    FOUND RES");
		var res = mobileres[key].shift();
		res.json(msg);
	}
	else {
		log("    PUSHING MSG");
		if(!mobilemsg[key])
			mobilemsg[key] = [];		
		msg.__time = Date.now();
		mobilemsg[key].push(msg);
	}
}

//********************************************************

function broadcast_mobile(msg) {

	log("BROADCAST "+JSON.stringify(msg));

	var gid = msg.gid;

	var pids = msg.pids;
	delete msg.pids;

	for(var i=0;i<pids.length;i++) {
		msg.pid = pids[i];
		send_mobile(msg);
	}

}

//********************************************************

function onmessage(req,res) {

	var msg = req.body;
	
	log("MESSAGE "+JSON.stringify(msg));
		
	switch(msg.type) {
		case "desktop":
			var gid = random_gid();	// game id
			res.send({type:"gid",value:gid});
			break;

		case "mobile":
			if(!msg.gid) break;
			var gid = msg.gid;
			var pid = ++playerid;
			res.json({type:"pid",value:pid});
			send_desktop({type:"mobile",pid:pid,gid:gid});
			break;

		case "welcome":
			res.json({});
			send_mobile(msg);
			break;

		case "user":
			console.log(JSON.stringify(msg));
			res.json({});
			send_desktop(msg);
			break;

		case "question":	
			res.json({});
			broadcast_mobile(msg);
			break;

		case "answer":
			res.json({});
			send_desktop(msg);
			break;

		case "status":
			res.json({});
			send_mobile(msg);
			break;
		}
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

function log(msg) {
	if(debug)
		console.log(msg);
}

//********************************************************

function cleanup() {

	var limit = Date.now()-300000;	// 5 mns

	for(var key in desktopres)
		clean(desktopres[key]);
	
	for(var key in desktopmsg)
		clean(desktopmsg[key]);

	for(var key in mobileres)
		clean(mobileres[key]);

	for(var key in mobilemsg)
		clean(mobilemsg[key]);

	function clean(list) {	
		for(var i=list.length-1;i>=0;i--)
			if(list[i].__time<limit)
				list.splice(i,1);
	}

}

//********************************************************

