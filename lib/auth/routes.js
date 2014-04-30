var logger   = require('../common/logger')(module);
var passport = require('passport');
var server   = require('../api/server');

server.get('/logout', function(req, res){
	req.logout();
	req.setToastMessage("info", "auth.logged_out");
	res.redirect(server.mountPath + '/dashboard');
});

server.get('/login', 
	passport.authenticate('google', { failureRedirect: server.mountPath + '/dashboard' }), afterLogin);

server.get('/auth/google/return',
	passport.authenticate('google', { failureRedirect: server.mountPath + '/dashboard' }), afterLogin);

function afterLogin(req, res){
	var redirectPath = req.session.afterLoginRedirect || (server.mountPath + '/admin');
	res.redirect(redirectPath);
}
