var _              = require('lodash');
var config         = require('../common/config');
var GoogleStrategy = require('passport-google-oauth2').Strategy;
var logger         = require('../common/logger')(module);
var passport       = require('passport');
var server         = require('../api/server');


module.exports.requireAdminUser = requireAdminUser;

passport.serializeUser(function(user, done){
	// logger.trace({ user: user }, "serializing user -> obj");
	done(null, user);
});

passport.deserializeUser(function(obj, done){
	// logger.trace({ obj: obj }, "deserializing obj -> user");
	done(null, obj);
});

passport.use(new GoogleStrategy({
		clientID: config.auth.google.clientID,
		clientSecret: config.auth.google.clientSecret,
		callbackURL: config.auth.google.callbackURL,
		passReqToCallback: true

	}, function(req, accessToken, refreshToken, profile, done){
		// logger.trace({ identifier: identifier, profile: profile }, "verifying user");

		var email = profile.emails[0].value;
		var user = {
			fullname: profile.displayName || email,
			email: email,
			roles: {
				isAdmin: _.contains(config.auth.admins, email)
			},
			googleId: profile.id
		};

		done(null, user);
	}));

function requireAdminUser(req, res, next){
	var isAuthenticated = req.isAuthenticated();
	var isAuthorized = isAuthenticated && req.user && req.user.roles.isAdmin;

	// logger.trace({ isAuthenticated: isAuthenticated, user: req.user }, "checking if %s is an admin with access to %s", req.user, req.path);

	if(!isAuthenticated){
		req.session.afterLoginRedirect = req.originalUrl;
		res.redirect(server.mountPath + '/login');
	} else if(!isAuthorized){
		req.setToastMessage("error", "auth.authenticated_but_not_authorized_for_admin");
		req.logout();
		res.redirect(server.mountPath + '/dashboard');
	} else {
		next();
	}
}

