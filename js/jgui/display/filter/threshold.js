(function() {
	function Threshold(threshold) {
		jgui.display.filter.ImageFilter.apply(this, arguments);
		this.threshold = threshold;
	}
	
	Threshold
		.extend(jgui.display.filter.ImageFilter)
		.namespace('jgui.display.filter.Threshold')
		.properties('threshold');
	
	Threshold.prototype.process = function(data) {
		for (var i=0; i<data.length; i+=4) {
			var r = data[i];
			var g = data[i+1];
			var b = data[i+2];
			var v = (0.2126*r + 0.7152*g + 0.0722*b >= this.threshold) ? 255 : 0;
			data[i] = data[i+1] = data[i+2] = v;
		}
	};
})();
