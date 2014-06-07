(function() {
	
	function Sprite() {
		jgui.display.Element.apply(this, arguments);
		this.mouseEnabled = true;
	}
	
	Sprite
		.extend(jgui.display.Element)
		.namespace("jgui.display.Sprite")
		.properties('mouseEnabled');
	
	// rendering
	Sprite.prototype.renderGeometry = function(scene) {
		this.depth = scene.__depth;
		scene.__depth = scene.__depth + 1;
		if (this.mouseEnabled) this.layer().addToQuadTree(this);
		jgui.display.Element.prototype.renderGeometry.apply(this, arguments);
	};
	
	// events
	Sprite.prototype.mouseover = function(localPoint) {
		this.style.oldBg = this.style.background;
		this.style.background = Colors.red;
		//console.log("mouseover " + this.toString());
	};
	
	Sprite.prototype.mousemove = function(localPoint) {
		
	};
	
	Sprite.prototype.mouseout = function() {
		this.style.background = this.style.oldBg;
	};
	
	Sprite.prototype.mousedown = function(localPoint) {
		console.log(this.name + " mousedown " + localPoint.toString());
	};
	
	Sprite.prototype.mousedownhold = function(localPoint) {
		console.log(this.name + " mousedownhold " + localPoint.toString());
	};
	
	Sprite.prototype.mouseup = function(localPoint) {
		console.log(this.name + " mouseup " + localPoint.toString());
	};
})();