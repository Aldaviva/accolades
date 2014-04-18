(function(scope){

	var Dashboard = scope.Dashboard = function(el){
		var accoladeCollection = new AccoladeCollection();
		var accoladeListView = new AccoladeListView({ collection: accoladeCollection, el: $('.people', el).get(0) });

		accoladeListView.render();
		accoladeCollection.fetch({ reset: true });

		//TODO maybe add push support
		// setInterval(function(){
		// 	accoladeCollection.fetch(); //may want to reset
		// }, 15*1000);
	};

})(this);