(function(scope){

	var Dashboard = scope.Dashboard = function(el){
		_.bindAll(this);
		this.el = el;

		this.initAccoladeList();
	};

	Dashboard.prototype.initAccoladeList = function() {
		this.accoladeCollection = new AccoladeCollection();
		var accoladeListView = new DashboardAccoladeListView({
			collection: this.accoladeCollection,
			el: $('.accolades', this.el).get(0)
		});

		accoladeListView.render();
		this.accoladeCollection.fetch({ reset: true });

		//TODO maybe add push support
		// setInterval(function(){
		// 	accoladeCollection.fetch(); //may want to reset
		// }, 15*1000);
	};

})(this);