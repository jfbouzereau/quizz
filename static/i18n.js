var I_WELCOME = "Bienvenue % !";
var I_TEAM = "Nom de l'équipe";
var I_ANSWER = "Vous avez répondu %";
var I_NANSWER = "Vous n'avez pas répondu";
var I_USCORE = "Score %";
var I_SCORE = "SCORE";
var I_FSCORE = "SCORE FINAL";
var I_THANKS = "Merci";
var I_WAIT = "Attente de la question %...";

function i18n(msg,param) {
	return msg.replace(/[%]/,param);
}

