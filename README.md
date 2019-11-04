## QUIZZ

Quizz is a [kahoot](https://kahoot.com)-like game.

The organizer shows a series of questions at the screen,
and the players choose the answer on their smartphone,
amongst four possibilities.

![question1](question1.png)  



![question2](question2.png)

Between each question, the score of all the players is shown.

## INSTALLATION

Run `npm install` from the directory to install the 
dependencies (so far only express and ws are required).

By default the server listens to port 8000. This can be changed 
in `server.js` .

The questions are proposed during 10 seconds. This can be changed
in `static/desktop.html` .

The interface is currently in french. The file `static/i18n.js`
can be customized and adapted to your language.

## GAME PREPARATION

Currently, the archive comes with a short game named `demo`
with 20 questions in french. 

You can either modify the server
to permanently include other games, or have a local file on your desktop
to be used temporarily.

### ON THE SERVER

To create a game named `mygame` for example :
* create a subdirectory `mygame` in the directory `static`
* put the pictures of all the questions in this subdirectory
* modify the file `static/games.json` to contain the list of games :
```
	[
		{"name":"mygame",
		"questions":[
			{
			img:"picture1.jpg",
			choices:["choice1of1","choice2of1","choice3of1","choice4of1"],
			answer:2	
			},
			{
			img:"picture2.jpg",
			choices:["choice1of2","choice2of2","choice3of2","choice4of2"],
			answer:4
			},
			...
			]
		}
		,
		{
		"name":"anothergame",
	...
		}
	]
```

### ON THE DESKTOP

If you are not able/willing to change the server, you can create 
on your desktop a zip archive containing the file `games.json`  and
the directories of the various games. 

## USAGE

The main display and the smartphones must have access to the server. 
For example they can be on the same wifi network.  
But you can also use [ngrok](https://ngrok.com) to expose the server at a public address.

* Run the server :
```
node server.js
```

* in the desktop browser open the main page :
```
http://myaddress:8000
```
The url to be used by the smartphones is displayed in the header.  
If you move the mouse over this header,
the corresponding qrcode is displayed, to make
smartphone connections easer.

* on each smarphone open the page
```
http://myaddress:8000/xyz  ( as displayed on the desktop )
```

* wait for each player to be connected

* click OK

* choose the game to be played in the menu, or drop the zip file
prepared in the above step.

## TRY ONLINE

You can try the demo : [here](http://lerallyemobile.fr:8000)

## ACKNOWLEDGEMENT

When a local zip file in dropped onto the interface, the file in
uncompressed with the help of the [zip.js](https://github.com/gildas-lormeau/zip.js) library by Gildas Lormeau.

The initial QRCode is displayed with David Shim's [QRCode.js](https://davidshimjs.github.io/qrcodejs/)
	
