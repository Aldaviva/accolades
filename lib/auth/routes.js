var logger   = require('../common/logger')(module);
var passport = require('passport');
var server   = require('../api/server');

server.get('/logout', function(req, res){
	req.logout();
	res.redirect(server.mountPath + '/dashboard');
});

server.get('/login', 
	passport.authenticate('google', { failureRedirect: server.mountPath + '/dashboard' }),
	function(req, res){
		res.redirect(server.mountPath + '/admin');
	});

server.get('/auth/google/return',
	passport.authenticate('google', { failureRedirect: server.mountPath + '/dashboard' }),
	function(req, res){
		res.redirect(server.mountPath + '/admin');
	});