var I_GAMES = "Questionnaires";					// games
var I_WELCOME = "Bienvenue % !";				// welcome
var I_TEAM = "Nom de l'équipe";					// name of your team
var I_ANSWER = "Vous avez répondu %";			// you answered
var I_NANSWER = "Vous n'avez pas répondu";		// you didnt answer
var I_USCORE = "Score %";						// score
var I_SCORE = "SCORE";							// score
var I_FSCORE = "SCORE FINAL";					// final score
var I_THANKS = "Merci";							// thank you
var I_WAIT = "Attente de la question %...";		// waiting for question
var I_SHOW = "Montrer les réponses";			// show the answers
var I_SETUP = "Réglages";						// setup
var I_DELAY = "% secondes";						//
var I_COLOR = "Mélanger les couleurs";			// shuffle the colors

function i18n(msg,param) {
	return msg.replace(/[%]/,param);
}

