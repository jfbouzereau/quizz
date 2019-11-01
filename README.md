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

To create a game named `mygame` for example :
* create a subdirectory `mygame` in the directory `static`
* put the pictures of all the questions in this subdirectory
* modify the file `static/games.json` :
```
	[{"name":"mygame",
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
	]}
	,
	{"name":"anothergame",
	...
	}
]
```
## USAGE

The main display and the smartphones must have access to the server. They can be on the same wifi network for example. But you can also use 
[ngrok](https://ngrok.com) to expose the server at a public address.

* Run the server :
```
node server.js
```

* on the desktop brower open the main page :
```
http://myaddress:8000
```

* on each smarphone open the page
```
http://myaddress:8000
```

* wait for each player to be connected

* click OK

* choose the game to be played in the menu, or drop a zip file containing
a games.json and the directories of the various games.

## TRY ONLINE

You can try the demo : [here](http://lerallyemobile.fr:8000)

## ACKNOWLEDGEMENT

When a local zip file in dropped onto the interface, the file in
uncompressed with the help of the [zip.js](https://github.com/gildas-lormeau/zip.js) library by Gildas Lormeau.


	
