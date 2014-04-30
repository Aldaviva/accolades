(function(scope){

	scope.Moment = scope.moment;

	var FIRSTNAME_PATTERN = /^(\w+)/;
	var FIRSTNAME_EXCEPTIONS = {
		"Akshay Kumar Sridharan": "Akshay Kumar"
	};

	var Accolade = scope.Accolade = Backbone.Model.extend({
		idAttribute: '_id',

		getFirstName: function(){
			var fullname = this.get('recipientName');
			if(FIRSTNAME_EXCEPTIONS[fullname]){
				return FIRSTNAME_EXCEPTIONS[fullname];
			} else {
				return FIRSTNAME_PATTERN.exec(fullname)[0];
			}
		},

		getRecipientPhotoUrl: function(){
			return Accolades.config.floorplan.baseUrl + '/people/' + this.get('recipientId') + '/photo';
		},

		validate: function(attr, opts){
			if(attr.message !== undefined && attr.message.length > 70){
				return new Error("Message must be 60 characters or less.");
			}
		}
	});

	var AccoladeCollection = scope.AccoladeCollection = Backbone.Collection.extend({
		url        : 'api/accolades',
		model      : Accolade,
		comparator : function(model){
			return -1 * model.get('dateCreated');
		}
	});

})(this);