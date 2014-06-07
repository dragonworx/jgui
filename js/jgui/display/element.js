(function() {
	
	function Element(name) {
		Element.hash(this);
		jgui.event.EventDispatcher.apply(this, arguments);
		this.name = name ? name : this.hash.toLowerCase();
		this.style = new Dictionary();
		this.style.foreground = Colors.white;
		this.style.background = Colors.blue;
		this.__transform = new jgui.geometry.Transform();
		this.localbounds = new jgui.geometry.Rectangle();
		this.globalbounds = new jgui.geometry.Rectangle();
		this.x = this.y = 0;
		this.__matrix = new jgui.geometry.Matrix();
		this.parent = undefined;
		this.children = new List();
		this.painter = new jgui.display.Painter();
		var size = this.defaultSize();
		this.setSize(size.width, size.height);
		this.mouseEnabled = true;
	}
	
	Element
		.extend(jgui.event.EventDispatcher)
		.namespace("jgui.display.Element")
		.properties('name', 'style', '__transform', 'width', 'height', 'localbounds', 'globalbounds', 'x', 'y', '__matrix', 'painter', 'mouseEnabled');
		
	Element.hash = {};
	Element.hash = function(obj) {
		if (!Element.hash[obj.constructor.name]) Element.hash[obj.constructor.name] = 0;
		Element.hash[obj.constructor.name] = Element.hash[obj.constructor.name] + 1;
		obj.hash = obj.constructor.name + Element.hash[obj.constructor.name];
	};
	Element.prototype.hashName = function() { return "$1($2)".format(this.name, this.hash); };
	
	Element.prototype.duplicate = function() {
		// this gets around the circular reference which occurs when copying children who have a parent (the parent copy gets called which calls the children, which calls the parent...)
		// first do a normal copy (without parent or children as not defined in class properties)
		var obj = new this.constructor; obj.clone(this);
		// set new object to same parent (will be in same same children collection so ok)
		obj.parent = this.parent;
		// now manually copy this children collection recusively into new object
		this.copyChildren(obj);
		// return new object
		return obj;
	};
	
	Element.prototype.copyChildren = function(obj) {
		for (var i=0; i<this.children.length; i++) {
			var child = this.children[i].copy();
			obj.add(child);
			this.children[i].copyChildren(child);
		}
	};
	
	// parent children
	Element.prototype.setName = function(name) { this.name = name; return this; };
	Element.prototype.add = function(child) { this.children.add(child); child.parent = this; return this; }
	Element.prototype.remove = function(child) { this.children.remove(child); child.parent = undefined; return this; }
	Element.prototype.child = function(indexOrName) {
		if (typeof(indexOrName) == "string") for (var i=0; i<this.children.length; i++) if (this.children[i].name == indexOrName) return this.children[i];
		if (typeof(indexOrName) == "number") return this.children[indexOrName];
	};
	Element.prototype.scene = function() {
		var obj = this.parent;
		while (obj.constructor.name != 'Scene')
			obj = obj.parent;
		return obj;
	};
	Element.prototype.layer = function() {
		var obj = this.parent;
		while (obj.constructor.name != 'Layer')
			obj = obj.parent;
		return obj;
	};
	Element.prototype.parents = function() {
		var list = new List();
		if (!this.parent) return list;
		var obj = this;
		while (obj.parent) {
			list.add(obj.parent);
			obj = obj.parent;
		}
		return list;
	};
	Element.prototype.parentChain = function() {
		var list = this.parents().reverse();
		for (var i=0; i<list.length; i++) list[i] = list[i].hashName();
		return list.join('>');
	}
	
	// rendering, painting
	Element.prototype.renderGeometry = function(scene, layer) {
		this.depth = scene.__depth;
		scene.__depth = scene.__depth + 1;
		
		scene.pushTransform(this.__transform);
		this.__matrix.clone(scene.currentTransform());
		
		this.renderGlobalBounds();
		
		if (scene.mouseEnabled && layer.mouseEnabled && this.mouseEnabled) this.layer().addToQuadTree(this);
		
		for (var i=0; i<this.children.length; i++) {
			var child = this.children[i];
			child.renderGeometry(scene, layer);
		}
			
		scene.popTransform();
	};
	
	Element.prototype.paint = function(scene, layer) {
		layer.painter.setTransform(this.__matrix);
		layer.painter.setBlend(this.__matrix.alpha);

		if (scene.debug) {
			layer.painter.drawDebugRect(0, 0, this.width, this.height, this.style.background);
			layer.painter.drawPoint(this.__transform.origin.x, this.__transform.origin.y, this.style.foreground, 8, this.__transform.rotation);
			
			layer.painter.clearTransform();
			layer.painter.drawRect(this.globalbounds.x, this.globalbounds.y, this.globalbounds.width, this.globalbounds.height, this.style.background);
		} else {
			layer.painter.drawDebugRect(0, 0, this.width, this.height, this.style.background);
		}
		
		for (var i=0; i<this.children.length; i++) {
			var child = this.children[i];
			child.paint(scene, layer);
		}
	};
	
	Element.prototype.setAlpha = function(alpha) { this.__transform.alpha = alpha; return this; };
	Element.prototype.addFilter = function(filter) { return this.painter.addFilter(filter); };
	
	// geometry	
	Element.prototype.defaultSize = function() { return {width:100, height:100}; };
	
	Element.prototype.localToGlobal = function(x, y) { return this.__matrix.localToGlobal(x, y); };
	Element.prototype.globalToLocal = function(x, y) { return this.__matrix.globalToLocal(x, y); };
	
	Element.prototype.renderGlobalBounds = function() {
		var w = this.width;
		var h = this.height;
		var topLeft = this.localToGlobal(0, 0);
		var topRight = this.localToGlobal(w, 0);
		var bottomLeft = this.localToGlobal(0, h);
		var bottomRight = this.localToGlobal(w, h);

		this.globalbounds.set(topLeft.x, topLeft.y, bottomRight.x - topLeft.x, bottomRight.y - topLeft.y).encompass(topLeft, topRight, bottomLeft, bottomRight);
	};
	Element.prototype.addToGlobalBounds = function(bounds, deep) { if (!this.globalbounds.isEmpty()) bounds.union(this.globalbounds); if (deep) for (var i=0; i<this.children.length; i++) this.children[i].addToGlobalBounds(bounds, deep); };
	
	Element.prototype.setSize = function(w, h) { this.width = w; this.height = h; this.localbounds.width = this.width; this.localbounds.height = this.height; this.__transform.update(); this.painter.setSize(this.width, this.height); return this; };
	Element.prototype.setWidth = function(w) { return this.setSize(w, this.height); };
	Element.prototype.setHeight = function(h) { return this.setSize(this.width, h); };
	Element.prototype.resetSize = function() { var size = this.defaultSize(); return this.setSize(size.width, size.height); };
	
	Element.prototype.setOrigin = function(x, y) { this.__transform.origin.x = x; this.__transform.origin.y = y; this.__transform.update(); return this; };
	Element.prototype.setOriginX = function(x) { this.__transform.origin.x = x; this.__transform.update(); return this; };
	Element.prototype.setOriginY = function(y) { this.__transform.origin.y = y; this.__transform.update(); return this; };
	Element.prototype.resetOrigin = function() { return this.setOrigin(0, 0); };
	
	Element.prototype.setLocation = function(x, y) { this.__transform.translation.x = x; this.__transform.translation.y = y; this.x = x; this.y = y; this.__transform.update(); return this; };
	Element.prototype.setLocationX = function(x) { this.__transform.translation.x = x; this.x = x; this.__transform.update(); return this; };
	Element.prototype.setLocationY = function(y) { this.__transform.translation.y = y; this.y = y; this.__transform.update(); return this; };
	Element.prototype.move = function(x, y) { this.__transform.translation.x = this.__transform.translation.x + x; this.__transform.translation.y = this.__transform.translation.y + y; this.x = this.x + x; this.y = this.y + y; this.__transform.update(); return this; };
	Element.prototype.moveX = function(x) { this.__transform.translation.x = this.__transform.translation.x + x; this.x = this.x + x; this.__transform.update(); return this; };
	Element.prototype.moveY = function(y) { this.__transform.translation.y = this.__transform.translation.y + y; this.y = this.y + y; this.__transform.update(); return this; };
	Element.prototype.resetLocation = function() { return this.setLocation(0, 0); };
	
	Element.prototype.setRotation = function(deg) { this.__transform.rotation = deg; this.__transform.update(); return this; };
	Element.prototype.rotate = function(deg) { this.__transform.rotation = this.__transform.rotation + deg; this.__transform.update(); return this; };
	Element.prototype.resetRotation = function() { return this.setRotation(0, 0); };
	
	Element.prototype.setScale = function(x, y) { this.__transform.scale.x = x; this.__transform.scale.y = y; this.__transform.update(); return this; };
	Element.prototype.setScaleX = function(x) { this.__transform.scale.x = x; this.__transform.update(); return this; };
	Element.prototype.setScaleY = function(y) { this.__transform.scale.y = y; this.__transform.update(); return this; };
	Element.prototype.resetScale = function() { return this.setScale(1, 1); };
	
	Element.prototype.setSkew = function(x, y) { this.__transform.skew.x = x; this.__transform.skew.y = y; this.__transform.update(); return this; };
	Element.prototype.setSkewX = function(x) { this.__transform.skew.x = x; this.__transform.update(); return this; };
	Element.prototype.setSkewY = function(y) { this.__transform.skew.y = y; this.__transform.update(); return this; };
	Element.prototype.resetSkew = function() { return this.setSkew(1, 1); };
	
	Element.prototype.setCenter = function(x ,y) { this.setOrigin(this.width / 2, this.height / 2); return this.setLocation(x, y); };
	Element.prototype.setCenterX = function(x) { this.setOriginX(this.width / 2); return this.setLocationX(x); };
	Element.prototype.setCenterY = function(y) { this.setOriginY(this.height / 2); return this.setLocationY(y); };
	
	// style
	Element.prototype.setStyle = function(key, value) { this.style[key] = value; return this; };
	
	// conversion
	Element.prototype.toString = function() { return "'$1' $2".format(this.hashName(), this.parentChain()); };
})();