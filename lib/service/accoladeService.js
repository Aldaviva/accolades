var _        = require('lodash');
var Accolade = require('../data/model/Accolade');
var Moment   = require('moment');

module.exports = {
	insert: insert,
	find: find
};

function insert(accolade){
	_.extend(accolade, {
		pipelineState: 'pending',
		dateCreated: new Moment()
	});

	return accolade.savePromise();
}

function find(query){
	return Accolade.findPromise({});
}