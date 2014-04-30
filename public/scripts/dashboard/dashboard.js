(function(scope){

	var Dashboard = scope.Dashboard = function(el){
		_.bindAll(this);
		this.el = el;

		this.initAccoladeList();
		this.renderToastMessage();
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

	Dashboard.prototype.renderToastMessage = function() {
		// debugger;
		var toastMessage = Accolades.toastMessage;
		if(toastMessage){
			var label = TOAST_MESSAGES_TO_LABELS[toastMessage.message] || toastMessage.message;
			var toastEl = $('<div>', {
				class: 'toastMessage '+toastMessage.level,
				text: label,
				title: 'click to close'
			});

			var dismissToast = function(){
				if(dismissTimeout){
					clearTimeout(dismissTimeout);
					dismissTimeout = null;
				}

				toastEl && toastEl.animate({
					top: -1 * toastEl.height()
				}, function(){
					toastEl.remove();
				});
			};
			toastEl.click(dismissToast);
			var timeoutMillis = TOAST_TIMEOUTS[toastMessage.level];
			var dismissTimeout;
			if(timeoutMillis){
				dismissTimeout = setTimeout(dismissToast, timeoutMillis); //TODO testing
			}

			// toastEl.css('opacity', 0);
			setTimeout(_.bind(function(){
				toastEl
					.hide()
					.appendTo(this.el)
					.css('top', -1 * toastEl.height())
					.show()
					.animate({
						top: 0
					});
			}, this), 250);
		}
	};

	var TOAST_MESSAGES_TO_LABELS = {
		'auth.authenticated_but_not_authorized_for_admin': 'Only HR has administrative access.',
		'auth.logged_out': 'Logged out',
		'admin.accolade.status.approved': 'Approved recognition',
		'admin.accolade.status.rejected': 'Rejected recognition'
	};

	var TOAST_TIMEOUTS = {
		info: 6*1000,
		warning: 0,
		error: 0
	};

})(this);