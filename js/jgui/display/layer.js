(function() {
	
	function Layer() {
		this.__quadtree = new jgui.geometry.QuadTree(null, 0);
		jgui.display.Element.apply(this, arguments);
		this.style.foreground = Colors.darkgray;
		this.style.background = Colors.black;
		this.__quadtree.createNodes();
		this.left = 0;
		this.top = 0;
		this.painter.createCanvas();
		this.painter.setCanvasId(this.name);
		this.setQuality(jgui.display.SHARP);
		this.trails = false;
	}
	
	Layer
		.extend(jgui.display.Element)
		.namespace('jgui.display.Layer')
		.properties('__quadtree', 'left', 'top', 'quality', 'trails');
	
	Layer.prototype.layer = function() {
		return this;
	};
	
	Layer.prototype.appendTo = function(container) { container.appendChild(this.painter.canvas); return this; };
	
	Layer.prototype.addToQuadTree = function(element) { this.__quadtree.add(element); return this; };
	
	Layer.prototype.elementAt = function(x, y) {
		return this.__quadtree.elementAt((x - this.left) * this.quality, (y - this.top) * this.quality, true);
	};
	
	Layer.prototype.setSize = function(w, h) {
		jgui.display.Element.prototype.setSize.apply(this, arguments);
		this.setQuality(this.quality);
		return this;
	};
	
	Layer.prototype.setQuality = function(quality) {
		this.quality = quality;
		var w = this.width * this.quality;
		var h = this.height * this.quality;
		this.painter.setSize(this.width, this.height, w, h);
		this.__quadtree.setSize(w, h);
		return this;
	};
	
	Layer.prototype.setPosition = function(left, top) {
		this.left = left;
		this.top = top;
		this.painter.canvas.style.left = Math.round(this.left) + 'px';
		this.painter.canvas.style.top = Math.round(this.top) + 'px';
		return this;
	};
	
	Layer.prototype.localToGlobal = function(x, y) { return this.__matrix.localToGlobal(x, y).scale(1 / this.quality); };
	Layer.prototype.globalToLocal = function(x, y) { return this.__matrix.globalToLocal(x, y).scale(this.quality); };
	
	Layer.prototype.renderGeometry = function(scene) {
		if (this.mouseEnabled) this.__quadtree.clear();
		this.globalbounds.clear();

		if (this.parent) scene.currentTransform().translate(this.left * -1, this.top * -1);
		scene.currentTransform().scale(this.quality, this.quality);

		if (this.parent) scene.pushTransform(this.parent.__transform);

		scene.pushTransform(this.__transform);
		this.__matrix.clone(scene.currentTransform());
		
		for (var i=0; i<this.children.length; i++) {
			var child = this.children[i];
			child.renderGeometry(scene, this);
		}
		
		scene.popTransform();
		
		if (this.parent) scene.popTransform();
		
		for (var i=0; i<this.children.length; i++) this.children[i].addToGlobalBounds(this.globalbounds, true);
		this.globalbounds.move(this.left, this.top);
		this.globalbounds.scale(1 / this.quality);
		
		if (scene.mouseEnabled && this.mouseEnabled) scene.addToQuadTree(this);
		
		this.geometryChanged = false;
	};
	
	Layer.prototype.renderGraphics = function(scene) {
		this.painter.push();
		if (this.trails) this.painter.clearTransform();
		else this.painter.clear();
		
		//if ((!scene.debug) && (!this.globalbounds.isEmpty()))
		//	this.painter.setClipRect(this.globalbounds.x, this.globalbounds.y, this.globalbounds.width, this.globalbounds.height);
		
		this.painter.setBlend(this.__matrix.alpha);
		
		for (var i=0; i<this.children.length; i++) {
			var child = this.children[i];
			child.paint(scene, this);
		}
		
		if (scene.debug) {		
			if (!this.globalbounds.isEmpty()) {
				this.painter.clearTransform();
				//this.__quadtree.paint(this.painter);
				this.painter.context.save(); this.painter.context.translate(this.left * -1, this.top * -1); this.painter.context.scale(this.quality, this.quality);
				this.painter.drawRect(this.globalbounds.x, this.globalbounds.y, this.globalbounds.width, this.globalbounds.height, Colors.white, 2);
				this.painter.context.restore();
				this.painter.context.scale(this.quality, this.quality);
				//this.painter.drawDebugRect(0, 0, this.width - 1, this.height - 1, Color.fromString(this.style.foreground).opacity(0.1).toString(), this.style.foreground);
				this.painter.drawRect(0, 0, this.width - 1, this.height - 1, Colors.blue, 1);
			}
		}
		
		this.painter.pop();
		this.painter.applyFilters();
	};
	
	Layer.prototype.setTrails = function(bool) { this.trails = bool; return this; };
})();