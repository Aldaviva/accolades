var db = require('../db');

var accoladeSchema = new db.Schema({
	dateCreated   : 'Moment',
	fromName      : String,
	message       : String,
	pipelineState : String,
	recipientId   : String
});

module.exports = db.model('Accolade', accoladeSchema);