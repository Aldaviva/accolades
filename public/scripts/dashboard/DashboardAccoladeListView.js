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
			var accoladePersonView = new DashboardAccoladeListItemView({ model: model });
			accoladePersonView.render();

			var sortedIndex = _.sortedIndex(this.collection.models, model, this.collection.comparator);
			if(sortedIndex === 0){
				this.$el.prepend(accoladePersonView.el);
			} else {
				this.$el.children().eq(sortedIndex - 1).after(accoladePersonView.el);
			}

			model.views = model.views || {};
			model.views.accoladePersonView = accoladePersonView;
		}
	});

})(this);