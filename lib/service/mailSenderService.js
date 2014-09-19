var _          = require('lodash');
var config     = require('../common/config');
var logger     = require('../common/logger')(module);
var mediator   = require('../common/mediator');
var nodemailer = require('nodemailer');
var Q          = require('q');
var request    = require('pr-request2');


var TEMPLATES = {
	FROM    : _.template("Employee Recognition <accolades@bluejeansnet.com>"),
	ACCOLADE_CREATED: {
		SUBJECT : _.template("<%= recipient %> was recognized by <%= from %>"),
		BODY    : _.template('<i>&quot;<%- message %>&quot;</i><br><br>'
			+ '<a href="<%= approvalUrl %>">Approve</a> - <a href="<%= rejectionUrl %>">Reject</a><br><br>'
			+ 'Or go to <a href="<%= adminUrl %>">Employee Recognition Admin</a>.')
	},
	ACCOLADE_APPROVED: {
		SUBJECT : _.template("You were recognized by <%= from %>"),
		BODY    : _.template('&quot;<%- message %>&quot;<br>' +
			'<i>&ndash;<%- from %></i>')
	}
};

var smtpTransport = nodemailer.createTransport("SMTP", {
	host: config.smtp.host
});	

connectEvents();


function connectEvents(){
	mediator.subscribe('accolade:created', onAccoladeCreated);
	mediator.subscribe('accolade:approved', onAccoladeApproved);
}

function onAccoladeCreated(accolade){
	var approvalUrl  = config.httpServer.baseUrl+"/admin/accolades/"+accolade.id+"/approve";
	var rejectionUrl = config.httpServer.baseUrl+"/admin/accolades/"+accolade.id+"/reject";
	var adminUrl     = config.httpServer.baseUrl+"/admin";

	var recipients = config.auth.admins;

	var subject = TEMPLATES.ACCOLADE_CREATED.SUBJECT({
		from         : accolade.fromName,
		recipient    : accolade.recipientName
	});
	
	var body = TEMPLATES.ACCOLADE_CREATED.BODY({
		from         : accolade.fromName,
		recipient    : accolade.recipientName,
		message      : accolade.message,
		approvalUrl  : approvalUrl,
		rejectionUrl : rejectionUrl,
		adminUrl     : adminUrl
	});

	sendMail(recipients, subject, body);
}

function onAccoladeApproved(accolade){
	request({
			url: config.floorplan.baseUrl+'/people/'+accolade.recipientId,
			method: 'GET',
			json: true
		}).then(function(res){
			var recipient = res.body;
			var recipientEmail = recipient.email+"@bluejeansnet.com";

			var subject = TEMPLATES.ACCOLADE_APPROVED.SUBJECT({
				from: accolade.fromName
			});

			var body = TEMPLATES.ACCOLADE_APPROVED.BODY({
				from: accolade.fromName,
				message: accolade.message
			});

			return sendMail(recipientEmail, subject, body);
		});
}

function sendMail(recipients, subject, htmlBody){
	var deferred = Q.defer();
	recipients = _.flatten([recipients]);

	var to = recipients.join(', ');
	var mailOptions = {
		from    : TEMPLATES.FROM({}),
		to      : to,
		subject : subject,
		html    : htmlBody
	};

	smtpTransport.sendMail(mailOptions, deferred.makeNodeResolver());

	deferred.promise
		.then(function(){
			logger.info({ to: to, subject: subject }, "Emails sent.");
		}, function(err){
			logger.error({ error: err }, "Email sending failed.");
		});

	return deferred.promise;
}