(function(scope){

	scope.Moment = scope.moment;
	delete scope.moment;

	var FIRSTNAME_PATTERN = /^(\w+)/;

	var Accolade = scope.Accolade = Backbone.Model.extend({
		getFirstName: function(){
			var fullname = this.get('recipientName');
			if(fullname == 'Akshay Kumar Sridharan'){
				return "Akshay Kumar";
			} else {
				return FIRSTNAME_PATTERN.exec(fullname)[0];
			}
		},

		getRecipientPhotoUrl: function(){
			return config.floorplan.baseUrl + '/people/' + this.get('recipientId') + '/photo';
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