(function(scope){

	var DATE_FORMAT = 'MMMM D';

	var AdminAccoladeListItemView = scope.AdminAccoladeListItemView = Backbone.View.extend({

		className: 'accolade',

		events: function(){
			return {
				"click .approve" : _.partial(this.onStatusButtonClick, 'approved'),
				"click .reject"  : _.partial(this.onStatusButtonClick, 'rejected')
			};
		},

		initialize: function(){
			_.bindAll(this);
			this.connectEvents();
		},

		connectEvents: function(){
			this.model.on('change', this.render);
		},

		render: function(){
			if(this.$el.is(':empty')){
				this.$el.append(
					$('<img>', { class: 'photo' }),
					$('<div>', { class: 'recipientName' }),
					$('<div>', { class: 'messageAndByLine'}).append(
						$('<div>', { class: 'message' }),
						$('<div>', { class: 'byLine' }).append(
							'from ',
							$('<span>', { class: 'fromName' }),
							' &bull; ',
							$('<span>', { class: 'dateCreated' })
						)
					),
					$('<div>', { class: 'actions' }).append(
						$('<a>', { class: 'approve', href: '#' }).append($('<span>')),
						$('<a>', { class: 'reject',  href: '#' }).append($('<span>'))
					),
					$('<span>', { class: 'pendingBadge', title: 'This recognition is pending approval.' })
				);
			}

			this.$el.attr('data-accolade-id', this.model.id);

			this.$('.photo').attr({
				src: this.model.getRecipientPhotoUrl(),
				title: this.model.get('recipientName')
			});
			this.$('.recipientName')
				.text(this.model.getFirstName())
				.attr('title', this.model.get('recipientName'));
			this.$('.message').text(this.model.get('message'));
			this.$('.fromName').text(this.model.get('fromName'));
			this.$('.dateCreated').text(new Moment(this.model.get('dateCreated')).format(DATE_FORMAT));

			this.$el
				.removeClass('pending approved rejected')
				.addClass(this.model.get('status'));

			return this.el;
		},

		onStatusButtonClick: function(buttonName, event){
			event.preventDefault();
			var newStatus = (this.model.get('status') == buttonName)
				? 'pending' 
				: buttonName;
			this.model.save({ status: newStatus }, { patch: true });
		}
	});

})(this);