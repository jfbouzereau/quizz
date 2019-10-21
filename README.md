## QUIZZ

Quizz is a [kahoot](https://kahoot.com)-like game.

The organizer shows a series of questions at the screen,
and the players chose the answer on their smartphone,
amongst four possibilities.

Between each question, the score of all the players is shown.

## INSTALLATION

Run `npm install` from the directory to install the
dependencies (so far only express and ws required).

The file `i18n.js` may be customized and adapted to your language.

By default the server listens to port 8000. It can be changed 
in `server.js` .

## GAME PREPARATION

Currently, the archive comes with a short game named `demo`
with 16 questions in french.

To create a game named `mygame` for example :
* create a subdirectory `mygame` in the directory `static`
* put the pictures of all the questions in this subdirectory
* modify the file `static/games.js` :
```
var games = {
	mygame : [
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
	],
	anothergame : [
	...
	]
}
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

* click `OK` et voila !


	
