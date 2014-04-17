var _          = require('lodash');
var config     = require('../common/config');
var logger     = require('../common/logger')(module);
var mediator   = require('../common/mediator');
var nodemailer = require('nodemailer');
var Q          = require('q');

var FROM = "Employee Recognition <accolades@bluejeansnet.com>";

var smtpTransport = nodemailer.createTransport("SMTP", {
	host: config.smtp.host
});

connectEvents();


function connectEvents(){
	mediator.subscribe('accolade:created', onAccoladeCreated);
}

function onAccoladeCreated(opts){
	var accolade = opts.accolade;

	var approvalUrl = config.httpServer.baseUrl+"/admin/accolades/"+accolade.id+"/approve";
	var rejectionUrl = config.httpServer.baseUrl+"/admin/accolades/"+accolade.id+"/reject";

	var subject = accolade.recipientName + " was recognized by " + accolade.fromName;
	var body = accolade.recipientName + " was recognized by " + accolade.fromName + ".<br><br><a href=\""+approvalUrl+"\">Approve</a> - <a href=\""+rejectionUrl+"\">Reject</a>";

	sendMail(subject, body).done();
}

function sendMail(subject, htmlBody){
	var deferred = Q.defer();

	var mailOptions = {
		from: FROM,
		to: config.auth.admins.join(', '),
		subject: subject,
		html: htmlBody
	};

	smtpTransport.sendMail(mailOptions, deferred.makeNodeResolver());

	deferred.promise
		.then(function(){
			logger.info("Emails sent.");
		}, function(err){
			logger.error({ error: err }, "Email sending failed.");
		});

	return deferred.promise;
}