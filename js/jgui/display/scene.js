(function() {	
	
	function Scene() {
		this.__quadtree = new jgui.geometry.QuadTree(null, 0);
		jgui.display.Element.apply(this, arguments);
		this.__quadtree.createNodes();
		this.__transforms = new jgui.geometry.TransformStack();
		this.__layers = new List();
		this.layers = new Dictionary();
		this.debug = false;
		this.fps = 24;
		this.style.foreground = Colors.white;
		this.style.background = Colors.grey;
		this.__container = undefined;
		this.painter.createCanvas();
		this.painter.setCanvasId(this.name);
	}
	
	Scene
		.extend(jgui.display.Element)
		.namespace('jgui.display.Scene')
		.properties('__transforms', '__layers', 'layers', 'debug', 'fps', '__container', '__quadtree');
	
	// container
	Scene.prototype.appendTo = function(elementOrId) {
		this.__container = typeof(elementOrId) == "string" ? $id(elementOrId) : elementOrId;
		this.__container.style.position = 'relative';
		var size = jgui.dom.size(this.__container);
		if ((size.width > 0) && (size.height > 0)) this.setSize(size.width, size.height);
		this.__container.appendChild(this.painter.canvas);
		for (var i=0; i<this.__layers.length; i++) this.__layers[i].appendTo(this.__container);
		return this;
	};
	
	// layers
	Scene.prototype.createLayer = function(name, linked) {
		var layer = new jgui.display.Layer(name);
		this.addLayer(layer, linked == false ? false : true);
		return layer;
	};
	Scene.prototype.addLayer = function(layer, linked) {
		layer.setSize(this.width, this.height);
		this.__layers.add(layer);
		this.layers[layer.name] = layer;
		if (linked) this.add(layer);
		if (this.__container) layer.appendTo(this.__container);
		return layer;
	};
	Scene.prototype.deleteLayer = function(name) { var layer = this.layers[name]; this.__layers.remove(layer); delete this.layers[name]; return this; };
	Scene.prototype.duplicateLayer = function(name, newName) {
		var origLayer = this.layers[name];
		var newLayer = origLayer.duplicate();
		newLayer.name = newName;
		newLayer.painter.setCanvasId(newName);
		newLayer.setPosition(origLayer.left, origLayer.top);
		this.addLayer(newLayer);
		return newLayer;
	};
	
	// transform
	Scene.prototype.pushTransform = function(trans) { this.__transforms.push(trans); return this; };
	Scene.prototype.popTransform = function() { return this.__transforms.pop(); };
	Scene.prototype.currentTransform = function() { return this.__transforms.matrix; }
	
	// geometry
	Scene.prototype.defaultSize = function() { return {width:640,height:480}; };
	Scene.prototype.center = function() { this.setCenter(this.width / 2, this.height / 2); return this; };
	Scene.prototype.setSize = function(w, h) {
		jgui.display.Element.prototype.setSize.apply(this, arguments);
		this.__quadtree.setSize(w, h);
		return this;
	};
	Scene.prototype.addToQuadTree = function(element) { this.__quadtree.add(element); return this; };
	
	// rendering, drawing	
	Scene.prototype.render = function() {
		this.renderGeometry();
		this.renderGraphics();
	};
	
	Scene.prototype.renderGeometry = function() {
		if (this.mouseEnabled) this.__quadtree.clear();
		this.__depth = 0;
		this.__matrix = this.__transform.matrix();
		this.globalbounds.clear();
		for (var i=0; i<this.__layers.length; i++) {
			var layer = this.__layers[i];
			this.__transforms.clear();
			layer.renderGeometry(this);
		}
		this.renderGlobalBounds();
		for (var i=0; i<this.__layers.length; i++) this.__layers[i].addToGlobalBounds(this.globalbounds);
	};
	
	Scene.prototype.renderGraphics = function() {
		this.painter.push();
		this.painter.clear();
		if (this.debug)	
			this.painter.drawDebugRect(this.globalbounds.x, this.globalbounds.y, this.globalbounds.width, this.globalbounds.height, null, Colors.red);
		this.painter.setTransform(this.__matrix);
		this.painter.setBlend(this.__matrix.alpha);
		this.painter.drawDebugRect(0, 0, this.width, this.height, this.style.background, this.style.foreground);
		if (this.debug)
			this.painter.drawPoint(this.__transform.origin.x, this.__transform.origin.y, this.style.foreground, 8, this.__transform.rotation);
		for (var i=0; i<this.__layers.length; i++) {
			var layer = this.__layers[i];
			layer.renderGraphics(this);
		}
		this.painter.pop();
	};
	
	// events
	Scene.prototype.registerDomEvents = function() {
		this.events = {
			'mouseover': this.mouseover.scope(this),
			'mousemove': this.mousemove.scope(this),
			'mouseout': this.mouseout.scope(this),
			'mousedown': this.mousedown.scope(this),
			'mouseup': this.mouseup.scope(this)
		};
		jgui.dom.addEvent(this.__container, 'mouseover', this.events.mouseover);
		jgui.dom.addEvent(this.__container, 'mousemove', this.events.mousemove);
		jgui.dom.addEvent(this.__container, 'mouseout', this.events.mouseout);
		jgui.dom.addEvent(this.__container, 'mousedown', this.events.mousedown);
		jgui.dom.addEvent(this.__container, 'mouseup', this.events.mouseup);
		window.onunload = this.stop.scope(this);
	};
	
	Scene.prototype.unregisterDomEvents = function() {
		jgui.dom.removeEvent(this.__container, 'mouseover', this.events.mouseover);
		jgui.dom.removeEvent(this.__container, 'mousemove', this.events.mousemove);
		jgui.dom.removeEvent(this.__container, 'mouseout', this.events.mouseout);
		jgui.dom.removeEvent(this.__container, 'mousedown', this.events.mousedown);
		jgui.dom.removeEvent(this.__container, 'mouseup', this.events.mouseup);
	};
	
	Scene.prototype.mouseover = function(e) {
		this.mousepointFromEvent(e);
	};
	Scene.prototype.mousemove = function(e) {
		this.mousepointFromEvent(e);
	};
	Scene.prototype.mouseout = function(e) {
		//this.mousepoint.setXY(NaN,NaN);
	};
	Scene.prototype.mousedown = function(e) {
		this.mousepointFromEvent(e);
		this.ismousedown = true;
	};
	Scene.prototype.mouseup = function(e) {
		this.mousepointFromEvent(e);
		this.ismousedown = false;
	};
	
	Scene.prototype.mousepointFromEvent = function(e) {
		var canvasLocation = jgui.dom.offset(this.__container); var scroll = jgui.dom.scroll();
		var x = (e.clientX - canvasLocation.x + scroll.x);
		var y = (e.clientY - canvasLocation.y + scroll.y);
		this.mousepoint.setXY(x, y);
	};
	
	Scene.prototype.elementAt = function(x, y) {
		var sprite = undefined;
		this.__quadtree.searchList.clear();
		this.__quadtree.elementsAt(x, y);
		for (var i=0; i<this.__quadtree.searchList.length; i++) {
			var layer = this.__quadtree.searchList[i];
			sprite = layer.elementAt(x, y);
			if (sprite) return sprite;
		}
	};
	
	// event processing
	Scene.prototype.initEventsProcessing = function() {
		this.mousepoint = point(-100,-100); // can this be set from current mouse position in browser?
		this.mousebuttonstate = jgui.event.MOUSEBUTTONSTATE.UP;
		this.ismousedown = false;
		this.mousefocus = undefined;
		this.buttonfocus = undefined;
	};
	Scene.prototype.start = function() { this.registerDomEvents(); this.initEventsProcessing(); this.interval = setInterval(this.eventLoop.scope(this), 1000 / this.fps); }
	Scene.prototype.stop = function() { this.unregisterDomEvents(); clearInterval(this.interval); }
	Scene.prototype.eventLoop = function() {
		// fire enterframe event, render geometry then graphics
		this.dispatchEvent("enterframe");
		this.render();

		if (this.mouseEnabled) {
			// find current mouse element
			var sprite = this.elementAt(this.mousepoint.x, this.mousepoint.y);
			
			// process mouse movement
			if (sprite) {
				var localPoint = sprite.globalToLocal(this.mousepoint.x, this.mousepoint.y);
				if (!this.mousefocus) {
					this.mousefocus = sprite;
					this.__container.style.cursor = 'pointer';
					sprite.mouseover(localPoint);
				} else {
					if (this.mousefocus == sprite) {
						sprite.mousemove(localPoint);
					} else {
						var oldfocus = this.mousefocus;
						this.mousefocus = sprite;
						oldfocus.mouseout();
						this.mousefocus.mouseover();
					}
				}
			} else {
				if (this.mousefocus) {
					this.__container.style.cursor = 'default';
					this.mousefocus.mouseout();
					this.mousefocus = undefined;
				}
			}
			
			// process mouse button
			if (this.ismousedown) {
				switch (this.mousebuttonstate) {
					case jgui.event.MOUSEBUTTONSTATE.UP:
						this.mousebuttonstate = jgui.event.MOUSEBUTTONSTATE.DOWN;
						if ((this.mousefocus) && (!this.buttonfocus)) {
							this.buttonfocus = this.mousefocus;
							var localPoint = this.buttonfocus.globalToLocal(this.mousepoint.x, this.mousepoint.y);
							this.buttonfocus.mousedown(localPoint);
						}
						break;
					case jgui.event.MOUSEBUTTONSTATE.DOWN:
						this.mousebuttonstate = jgui.event.MOUSEBUTTONSTATE.HOLD;
						if (this.buttonfocus) {
							var localPoint = this.buttonfocus.globalToLocal(this.mousepoint.x, this.mousepoint.y);
							this.buttonfocus.mousedownhold(localPoint);
						}
						break;
				}
				if ((this.mousebuttonstate == jgui.event.MOUSEBUTTONSTATE.HOLD) && (this.buttonfocus)) {
					var localPoint = this.buttonfocus.globalToLocal(this.mousepoint.x, this.mousepoint.y);
					this.buttonfocus.mousedownhold(localPoint);
				}
			} else {
				switch (this.mousebuttonstate) {
					case jgui.event.MOUSEBUTTONSTATE.DOWN:
					case jgui.event.MOUSEBUTTONSTATE.HOLD:
						this.mousebuttonstate = jgui.event.MOUSEBUTTONSTATE.UP;
						if (this.buttonfocus) {
							var localPoint = this.buttonfocus.globalToLocal(this.mousepoint.x, this.mousepoint.y);
							this.buttonfocus.mouseup(localPoint);
							this.buttonfocus = undefined;
						}
						break;
				}
			}
		}
		
		this.dispatchEvent("exitframe");
	};
	
	Scene.prototype.toString = function() { return "$3 ($1x$2)".format(this.__transform.width, this.__transform.height, this.__transform.toShortString()); };
})();
