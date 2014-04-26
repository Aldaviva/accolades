(function(scope){

	var MAX_LISTVIEW_LENGTH = 6;

	var AdminAccoladeListView = scope.AdminAccoladeListView = Backbone.View.extend({

		initialize: function(){
			_.bindAll(this);
			this.connectEvents();
		},

		connectEvents: function(){
			this.collection.on('reset', this.addAll);
			this.collection.on('add', this.addOne);
		},

		render: function(){
			this.collection.forEach(function(model){
				if(model.views && model.views.accoladeListItemView){
					model.views.accoladeListItemView.render();
				}
			});

			return this.el;
		},

		addAll: function(coll){
			this.$el.empty();
			coll.map(this.addOne);
		},

		addOne: function(model){
			var accoladeListItemView = new AdminAccoladeListItemView({ model: model });
			this.$el.append(accoladeListItemView.render());

			model.views = model.views || {};
			model.views.accoladeListItemView = accoladeListItemView;
		}
	});

})(this);