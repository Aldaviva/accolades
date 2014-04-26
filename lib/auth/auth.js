var config         = require('../common/config');
var GoogleStrategy = require('passport-google').Strategy;
var logger         = require('../common/logger')(module);
var passport       = require('passport');
var server         = require('../api/server');


module.exports.requireAdminUser = requireAdminUser;

passport.serializeUser(function(user, done){
	logger.trace({ user: user }, "serializing user -> obj");
	done(null, user);
});

passport.deserializeUser(function(obj, done){
	logger.trace({ obj: obj }, "deserializing obj -> user");
	done(null, obj);
});

passport.use(new GoogleStrategy({
		returnURL: config.httpServer.baseUrl + '/auth/google/return',
		realm: config.httpServer.baseUrl
	}, function(identifier, profile, done){
		logger.trace({ identifier: identifier, profile: profile }, "verifying user");

		var email = profile.emails[0].value;
		var user = {
			fullname: profile.displayName,
			email: email,
			roles: {
				isAdmin: _.contains(config.auth.admins, email)
			},
			googleId: identifier
		};

		done(null, user);
	}));

function requireAdminUser(req, res, next){
	logger.trace({ isAuthenticated: req.isAuthenticated, user: req.user }, "checking if %s is an admin with access to %s", req.user, req.path);

	var isAuthenticated = req.isAuthenticated;
	var isAuthorized = isAuthenticated && req.user.roles.isAdmin;

	if(!isAuthenticated){
		res.redirect(server.mountPath + '/login');
	} else if(!isAuthorized){
		res.redirect(server.mountPath + '/dashboard');
	} else {
		return next();
	}
}