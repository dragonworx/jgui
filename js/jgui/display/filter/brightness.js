(function() {
	function Brightness(amount) {
		jgui.display.filter.ImageFilter.apply(this, arguments);
		this.amount = amount;
	}
	
	Brightness
		.extend(jgui.display.filter.ImageFilter)
		.namespace('jgui.display.filter.Brightness')
		.properties('amount');
	
	Brightness.prototype.process = function(data) {
		for (var i=0; i<data.length; i+=4) {
			data[i] = data[i] + this.amount;
			data[i+1] = data[i+1] + this.amount;
			data[i+2] = data[i+2] + this.amount;
		}
	};
})();
