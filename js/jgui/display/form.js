(function() {
	
	function Form(name) {
		jgui.event.EventDispatcher.apply(this, arguments);
		this.name = name ? name : null;
		this.style = new Dictionary();
		this.style.foreground = Colors.white;
		this.style.background = Colors.black;
		this.transform = new jgui.geometry.Transform();
		var size = this.defaultSize();
		this.width = size.width;
		this.height = size.height;
		this.localBounds = new jgui.geometry.Rectangle(0, 0, this.width, this.height);
		this.globalBounds = new jgui.geometry.Rectangle();
		this.x = this.y = 0;
		this.__matrix = new jgui.geometry.Matrix();
		this.alpha = 1.0;
		this.parent = undefined;
		this.children = new List();
	}
	
	Form
		.extend(jgui.event.EventDispatcher)
		.namespace("jgui.display.Form")
		.properties('name', 'style', 'transform', 'width', 'height', 'localBounds', 'globalBounds', 'x', 'y', '__matrix', 'alpha', 'parent', 'children');
		
	Form.prototype.copy = function() {
		var refList = new List();
		this.protectCircularReferencesBeforeCopy(this, refList);
		var copy = jgui.event.EventDispatcher.prototype.copy.apply(this, arguments);
		for (var i=0; i<refList.length; i++) refList[i].parent = this;
		return copy;
	};
	
	Form.prototype.protectCircularReferencesBeforeCopy = function(objectToBeCopied, refList) {
		if (this.parent == objectToBeCopied) {
			refList.add(this);
			this.parent = undefined;
		}
		for (var i=0; i<this.children.length; i++) this.children[i].protectCircularReferencesBeforeCopy(objectToBeCopied, refList);
	};
	
	// geometry
	Form.prototype.defaultSize = function() { return {width:100, height:100}; };
	
	Form.prototype.localToGlobal = function(x, y) { return this.__matrix.localToGlobal(x, y); };
	Form.prototype.globalToLocal = function(x, y) { return this.__matrix.globalToLocal(x, y); };
	Form.prototype.addToBounds = function(bounds) { bounds.union(this.globalBounds); for (var i=0; i<this.children.length; i++) this.children[i].addToBounds(bounds); };
	
	Form.prototype.setSize = function(w, h) { this.width = w; this.height = h; this.localBounds.width = this.width; this.localBounds.height = this.height; return this; };
	Form.prototype.setWidth = function(w) { this.width = w; this.localBounds.width = this.width; return this; };
	Form.prototype.setHeight = function(h) { this.height = h; this.localBounds.height = this.height; return this; };
	Form.prototype.resetSize = function() { var size = this.defaultSize(); return this.setSize(size.width, size.height); };
	
	Form.prototype.setOrigin = function(x, y) { this.transform.origin.x = x; this.transform.origin.y = y; this.transform.update(); return this; };
	Form.prototype.setOriginX = function(x) { this.transform.origin.x = x; this.transform.update(); return this; };
	Form.prototype.setOriginY = function(y) { this.transform.origin.y = y; this.transform.update(); return this; };
	Form.prototype.resetOrigin = function() { return this.setOrigin(0, 0); };
	
	Form.prototype.setLocation = function(x, y) { this.transform.translation.x = x; this.transform.translation.y = y; this.transform.update(); this.x = x; this.y = y; return this; };
	Form.prototype.setLocationX = function(x) { this.transform.translation.x = x; this.transform.update(); this.x = x; return this; };
	Form.prototype.setLocationY = function(y) { this.transform.translation.y = y; this.transform.update(); this.y = y; return this; };
	Form.prototype.resetLocation = function() { return this.setLocation(0, 0); };
	
	Form.prototype.setRotation = function(deg) { this.transform.rotation = deg; this.transform.update(); return this; };
	Form.prototype.rotate = function(deg) { this.transform.rotation = this.transform.rotation + deg; this.transform.update(); return this; };
	Form.prototype.resetRotation = function() { return this.setRotation(0, 0); };
	
	Form.prototype.setScale = function(x, y) { this.transform.scale.x = x; this.transform.scale.y = y; this.transform.update(); return this; };
	Form.prototype.setScaleX = function(x) { this.transform.scale.x = x; this.transform.update(); return this; };
	Form.prototype.setScaleY = function(y) { this.transform.scale.y = y; this.transform.update(); return this; };
	Form.prototype.resetScale = function() { return this.setScale(1, 1); };
	
	Form.prototype.setSkew = function(x, y) { this.transform.skew.x = x; this.transform.skew.y = y; this.transform.update(); return this; };
	Form.prototype.setSkewX = function(x) { this.transform.skew.x = x; this.transform.update(); return this; };
	Form.prototype.setSkewY = function(y) { this.transform.skew.y = y; this.transform.update(); return this; };
	Form.prototype.resetSkew = function() { return this.setSkew(1, 1); };
	
	Form.prototype.setCenter = function(x ,y) { this.setOrigin(this.width / 2, this.height / 2); this.setLocation(x, y); return this; };
	Form.prototype.setCenterX = function(x) { this.setOriginX(this.width / 2); this.setLocationX(x); return this; };
	Form.prototype.setCenterY = function(y) { this.setOriginY(this.height / 2); this.setLocationY(y); return this; };
	
	// parent children
	Form.prototype.add = function(child) { this.children.add(child); child.parent = this; return this; }
	Form.prototype.remove = function(child) { this.children.remove(child); child.parent = undefined; return this; }
	
	// rendering, painting
	Form.prototype.renderGeometry = function(scene) {
		scene.pushTransform(this.transform);
		this.__matrix.clone(scene.currentTransform());
		
		for (var i=0; i<this.children.length; i++)
			this.children[i].renderGeometry(scene);
			
		scene.popTransform();
		
		var topLeft = this.localToGlobal(0, 0);
		var topRight = this.localToGlobal(this.width, 0);
		var bottomLeft = this.localToGlobal(0, this.height);
		var bottomRight = this.localToGlobal(this.width, this.height);
		
		this.globalBounds.set(topLeft.x, topLeft.y, bottomRight.x - topLeft.x, bottomRight.y - topLeft.y).encompass(topLeft, topRight, bottomLeft, bottomRight);
	};
	
	Form.prototype.paint = function(scene) {
		scene.setTransformMatrix(this.__matrix);
		
		if (scene.debug) {
			scene.painter.drawDebugRect(0, 0, this.width, this.height, this.style.background);
			scene.painter.drawPoint(this.transform.origin.x, this.transform.origin.y, this.style.foreground, 10, this.transform.rotation);
			
			scene.clearTransform();
			scene.painter.drawRect(this.globalBounds.x, this.globalBounds.y, this.globalBounds.width, this.globalBounds.height, this.style.background);
			/*var topLeft = this.localToGlobal(0, 0);
			var topRight = this.localToGlobal(this.width, 0);
			var bottomLeft = this.localToGlobal(0, this.height);
			var bottomRight = this.localToGlobal(this.width, this.height);
			scene.painter.drawPoint(topLeft.x, topLeft.y, Colors.black, 5, 360);
			scene.painter.drawPoint(topRight.x, topRight.y, Colors.red, 5, 360);
			scene.painter.drawPoint(bottomLeft.x, bottomLeft.y, Colors.green, 5, 360);
			scene.painter.drawPoint(bottomRight.x, bottomRight.y, Colors.blue, 5, 360);*/
		} else {
			//scene.painter.fillRect(0, 0, this.width, this.height, this.style.background);
			scene.painter.drawDebugRect(0, 0, this.width, this.height, this.style.background);
		}
		
		for (var i=0; i<this.children.length; i++)
			this.children[i].paint(scene);
	};
})();