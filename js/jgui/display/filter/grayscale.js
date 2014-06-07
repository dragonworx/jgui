(function() {
	function Grayscale() {
		jgui.display.filter.ImageFilter.apply(this, arguments);
	}
	
	Grayscale
		.extend(jgui.display.filter.ImageFilter)
		.namespace('jgui.display.filter.Grayscale');
	
	Grayscale.prototype.process = function(data) {
		for (var i=0; i<data.length; i+=4) {
			var r = data[i];
			var g = data[i+1];
			var b = data[i+2];
			// CIE luminance for the RGB
			// The human eye is bad at seeing red and blue, so we de-emphasize them.
			var v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
			data[i] = data[i+1] = data[i+2] = v;
		}
	};
})();
