var Mediator = require('mediator-js');

var mediator = new Mediator.Mediator();
module.exports = mediator;


mediator.subscribe("accolade:approved", function(accolade){
	console.log(accolade.recipientName + " was just recognized by " + accolade.fromName);
});