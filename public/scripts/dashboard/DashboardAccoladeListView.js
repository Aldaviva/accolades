(function(scope){

	var MAX_LISTVIEW_LENGTH = 6;

	var DashboardAccoladeListView = scope.DashboardAccoladeListView = Backbone.View.extend({

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
				if(model.views && model.views.accoladePersonView){
					model.views.accoladePersonView.render();
				}
			});

			return this.el;
		},

		addAll: function(coll){
			this.$el.empty();
			coll.first(MAX_LISTVIEW_LENGTH)
				.map(this.addOne);
		},

		addOne: function(model){
			if(model.get('status') == 'approved'){
				var accoladePersonView = new DashboardAccoladeListItemView({ model: model });
				this.$el.append(accoladePersonView.render());

				model.views = model.views || {};
				model.views.accoladePersonView = accoladePersonView;
			}
		}
	});

})(this);