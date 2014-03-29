var _                = require('lodash');
var bodyParser       = require('body-parser');
var bunyanMiddleware = require('bunyan-middleware');
var config           = require('../common/config');
var cookieParser     = require('cookie-parser');
var express          = require('express');
var hbs              = require('hbs');
var http             = require('http');
var lessMiddleware   = require('less-middleware');
var path             = require('path');
var Q                = require('q');
var rootLogger       = require('../common/logger');
var slash            = require('express-slash');
var url              = require('url');

var server    = express();
var logger    = rootLogger(module);
var mountPath = url.parse(config.httpServer.baseUrl).pathname;
var publicDir = path.join(__dirname, 'public');

module.exports = server;
var closableServer = null;
server.set('port', config.httpServer.port);
var serverLogger = rootLogger().child({ module: 'express' });
serverLogger.level("warn");

server.set   ('env', 'production');
server.set   ('json spaces', 0);
server.enable('trust proxy');
server.enable('strict routing');
server.use   (bunyanMiddleware(serverLogger));
server.set   ('views', path.join(__dirname, 'views'));
server.set   ('view engine', 'html');
server.engine('html', hbs.__express);
server.use   (bodyParser.json());
server.use   (bodyParser.urlencoded());
server.use   (cookieParser());
server.use   (mountPath, lessMiddleware({ src: publicDir }));
server.use   (mountPath, express.static(publicDir));
server.use   (mountPath+'/api', server.router);
server.use   (mountPath, slash());

require('./routes');

server.use(function(req, res, next){
	res.send(404, { error: "Not found" });
});

server.use(function(err, req, res, next){
	serverLogger.error(err.stack || err.message);
	res.send(500, { error: err.message });
});

server.start = function(){
	var deferred = Q.defer();
	var port = server.get('port');

	closableServer = server.listen(port, function(err){
		if(err != null){
			deferred.reject(err);
		} else {
			deferred.resolve();
		}
	});
	closableServer.once('error', deferred.reject);

	return deferred.promise.then(
		function(){
			var address = closableServer.address();
			logger.info("Listening on http://%s:%d%s", address.address, address.port, mountPath);
		},
		function(err){ 
			if(err.code == 'EACCES'){
				logger.error("No access to port "+port);
			} else if(err.code == 'EADDRINUSE'){
				logger.error("Port "+port+" already in use.");
			} else {
				logger.error("Error starting server: "+err.message); 
			}
			throw err;
		}
	);
};

server.shutdown = function(){
	var deferred = Q.defer();
	if(closableServer){
		try {
			closableServer.close(function(err){
				if(err != null){
					logger.error("Unable to close: %s", err);
					deferred.reject(err);
				} else {
					logger.info("Shut down.");
					deferred.resolve();
				}
				closableServer = null;
			});
		} catch (e){
			logger.error(e);
			deferred.reject(e);
		}
	} else {
		logger.info("Shut down.");
		deferred.resolve();
	}
	return deferred.promise;
};