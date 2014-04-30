var _          = require('lodash');
var config     = require('../common/config');
var logger     = require('../common/logger')(module);
var mediator   = require('../common/mediator');
var nodemailer = require('nodemailer');
var Q          = require('q');

var FROM = "Employee Recognition <accolades@bluejeansnet.com>";
var SUBJECT_TEMPLATE = _.template("<%= recipient %> was recognized by <%= from %>");
var BODY_TEMPLATE = _.template('<%- recipient %> was recognized by <%- from %>:<br><br>'
	+ '<i>&quot;<%- message %>&quot;</i><br><br>'
	+ '<a href="<%= approvalUrl %>">Approve</a> - <a href="<%= rejectionUrl %>">Reject</a><br><br>'
	+ 'Or go to <a href="<%= adminUrl %>Employee Recognition Admin</a>');

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
	var adminUrl = config.httpServer.baseUrl+"/admin";

	var subject = SUBJECT_TEMPLATE({
		from         : accolade.fromName,
		recipient    : accolade.recipientName
	});
	var body = BODY_TEMPLATE({
		from         : accolade.fromName,
		recipient    : accolade.recipientName,
		message      : accolade.message,
		approvalUrl  : approvalUrl,
		rejectionUrl : rejectionUrl,
		adminUrl     : adminUrl
	});

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