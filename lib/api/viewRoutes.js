var _               = require('lodash');
var accoladeService = require('../service/accoladeService');
var auth            = require('../auth/auth');
var config          = require('../common/config');
var logger          = require('../common/logger')(module);
var server          = require('./server');

var defaultContext = {
	config: _.pick(config, ['floorplan', 'httpServer'])
};

server.get('/', function(req, res){
	res.redirect(server.mountPath + '/dashboard');
});

server.get('/dashboard', function(req, res){
	var context = _.merge({
		toastMessage: getAndRemoveToastMessage(req)
	}, defaultContext);

	res.render('dashboard', context);
});

server.get('/admin', auth.requireAdminUser, function(req, res){
	var context = _.merge({
		user: req.user,
		toastMessage: getAndRemoveToastMessage(req)
	}, defaultContext);

	res.render('admin', context);
});

server.get('/admin/accolades/:id/approve', auth.requireAdminUser, function(req, res, next){
	approveOrReject(req, res, next, 'approved');
});

server.get('/admin/accolades/:id/reject', auth.requireAdminUser, function(req, res, next){
	approveOrReject(req, res, next, 'rejected');
});

function approveOrReject(req, res, next, newStatus){
	accoladeService.updateDelta({
			_id: req.params.id,
			status: newStatus
		})
		.then(function(accolade){
			req.setToastMessage('info', 'admin.accolade.status.'+newStatus);
			res.redirect(server.mountPath + '/dashboard');
		})
		.fail(next);
}

function getAndRemoveToastMessage(req){
	var toastMessage = req.session.toastMessage;
	req.session.toastMessage = null;
	return toastMessage;
}