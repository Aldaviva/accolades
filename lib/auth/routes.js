var logger   = require('../common/logger')(module);
var passport = require('passport');
var server   = require('../api/server');

server.get('/logout', function(req, res){
	req.logout();
	req.setToastMessage("info", "auth.logged_out");
	res.redirect(server.mountPath + '/dashboard');
});

server.get('/login', passport.authenticate('google', { scope: [
    'https://www.googleapis.com/auth/plus.login',
    'https://www.googleapis.com/auth/plus.profile.emails.read'
]}));

server.get('/auth/google/callback', passport.authenticate('google', { 
    failureRedirect: server.mountPath + '/dashboard'
}), afterLogin);

function afterLogin(req, res){
	var redirectPath = req.session.afterLoginRedirect || (server.mountPath + '/admin');
	res.redirect(redirectPath);
}
