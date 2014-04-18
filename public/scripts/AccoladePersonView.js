(function(scope){

	var DATE_FORMAT = 'MMMM D';

	var AccoladePersonView = scope.AccoladePersonView = Backbone.View.extend({

		className: 'person',

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
					$('<div>', { class: 'message' }),
					$('<div>', { class: 'byLine' }).append(
						'from ',
						$('<span>', { class: 'fromName' }),
						' &bull; ',
						$('<span>', { class: 'dateCreated' })
					)
				);
			}

			this.$('.photo').attr({
				src: this.model.getRecipientPhotoUrl(),
				title: this.model.get('recipientName')
			});
			this.$('.recipientName').text(this.model.getFirstName());
			this.$('.message').text(this.model.get('message'));
			this.$('.fromName').text(this.model.get('fromName'));
			this.$('.dateCreated').text(new Moment(this.model.get('dateCreated')).format(DATE_FORMAT));

			return this.el;
		},
	});

})(this);