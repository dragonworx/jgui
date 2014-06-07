(function() {
	function QuadTree(bounds, depth) {
		this.bounds = bounds ? bounds : new jgui.geometry.Rectangle();
		this.depth = depth ? depth : 0;
		this.nodes = new List();
		this.children = new List();
		this.searchList = new List();
		this.enabled = this.depth == 0 ? true : false;
	}
	
	QuadTree
		.extend(jgui.Object)
		.namespace('jgui.geometry.QuadTree')
		.properties('bounds', 'depth', 'nodes', 'children', 'enabled');
	
	QuadTree.MAXDEPTH = 4;
	QuadTree.MAXCHILDREN = 4;
	
	QuadTree.prototype.createNodes = function() {
		var subrects = this.bounds.subdivide();
		this.nodes.add(new jgui.geometry.QuadTree(subrects[0], this.depth + 1));
		this.nodes.add(new jgui.geometry.QuadTree(subrects[1], this.depth + 1));
		this.nodes.add(new jgui.geometry.QuadTree(subrects[2], this.depth + 1));
		this.nodes.add(new jgui.geometry.QuadTree(subrects[3], this.depth + 1));
		if (this.depth + 1 < QuadTree.MAXDEPTH) for (var i=0; i<this.nodes.length; i++) this.nodes[i].createNodes();
		this.clear();
	};
	
	QuadTree.prototype.setSize = function(w, h) {
		this.bounds.setSize(w, h);
		this.reset();
		this.createNodes();
	};
	
	QuadTree.prototype.isNodesEmpty = function() {
		for (var i=0; i<this.nodes.length; i++) if (this.nodes[i].enabled) return false; return true; 
	};	
	
	QuadTree.prototype.clear = function(element) {
		this.enabled = this.depth == 0 ? true : false;
		for (var i=0; i<this.nodes.length; i++) {
			this.nodes[i].enabled = false;
			this.nodes[i].clear();
		}
		this.children.clear();
	};
	
	QuadTree.prototype.reset = function(element) {
		for (var i=0; i<this.nodes.length; i++) this.nodes[i].reset();
		this.nodes.clear();
		this.children.clear();
		this.enabled = this.depth == 0 ? true : false;
		this.__reset = true;
	};
	
	QuadTree.prototype.add = function(element) {
		if (!this.isNodesEmpty()) {
			for (var i=0; i<this.nodes.length; i++) if (this.nodes[i].bounds.intersects(element.globalbounds) && this.nodes[i].enabled) this.nodes[i].add(element);
		} else {
			this.children.add(element);
			if ((this.children.length > jgui.geometry.QuadTree.MAXCHILDREN) && (this.depth < jgui.geometry.QuadTree.MAXDEPTH)) {
				for (var i=0; i<this.nodes.length; i++) this.nodes[i].enabled = true;
				for (var i=0; i<this.children.length; i++) this.add(this.children[i]);
				this.children.clear();
				return;
			}
		}
	};
	
	QuadTree.prototype.nodeAt = function(x, y) {
		for (var i=0; i<this.nodes.length; i++) if (this.nodes[i].bounds.containsPoint(x, y)) return this.nodes[i];
	};
	
	QuadTree.prototype.elementsAt = function(x, y) {
		if (!this.isNodesEmpty()) {
			var node = this.nodeAt(x, y);
			if (node) node.elementsAt(x, y);
			return;
		}
		for (var i=this.children.length - 1; i>=0; i--) {
			var child = this.children[i];
			if (child.globalbounds.containsPoint(x, y)) this.searchList.push(child);
		}
	};
	
	QuadTree.prototype.elementAt = function(x, y, testLocally) {
		if (!this.isNodesEmpty()) {
			var node = this.nodeAt(x, y);
			if (node) return node.elementAt(x, y, testLocally);
		} else {
			for (var i=this.children.length - 1; i>=0; i--) {
				var child = this.children[i];
				if (child.globalbounds.containsPoint(x, y)) {
					if (testLocally) {
						var localPoint = child.globalToLocal(x, y);
						if (child.localbounds.containsPoint(localPoint.x , localPoint.y))
							return child;
					} else {
						return child;
					}
				}
			}
		}
	};
	
	QuadTree.prototype.paint = function(painter) {
		for (var i=0; i<this.nodes.length; i++) if (this.nodes[i].enabled) this.nodes[i].paint(painter);
		for (var i=0; i<this.children.length; i++) painter.fillRect(this.children[i].globalbounds, Color.named('yellow').opacity(0.15).toString());
		if (!this.children.isEmpty()) painter.fillRect(this.bounds, Color.named('yellow').opacity(0.1).toString());
		painter.drawRect(this.bounds, Color.named('yellow').opacity(0.25).toString());
	};
}());