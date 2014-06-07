(function() {
	function ImageFilter(painter) {
		this.painter = painter;
	}
	
	ImageFilter
		.extend(jgui.Object)
		.namespace('jgui.display.filter.ImageFilter')
		.properties('painter');
	
	ImageFilter.prototype.imageData = function() { return this.painter.context.getImageData(0, 0, this.painter.canvas.width, this.painter.canvas.height); };
	
	ImageFilter.prototype.apply = function() {
		var pixels = this.imageData();
		this.process(pixels.data);
		this.painter.context.putImageData(pixels, 0, 0);
	};
	
	ImageFilter.prototype.process = function(data) {
		
	};
})();
