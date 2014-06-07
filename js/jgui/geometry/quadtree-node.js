(function() {
	function QuadTreeNode(tree, bounds, depth) {
		this.tree = tree;
		this.bounds = bounds;
		this.depth = depth ? depth : 0;
		this.nodes = new List();
		this.children = new List();
		this.subrects = undefined;
	}
	
	QuadTreeNode
		.extend(jgui.Object)
		.namespace('jgui.geometry.QuadTreeNode')
		.properties('tree', 'bounds', 'depth', 'nodes', 'children', 'subrects');
	
	QuadTreeNode.prototype.setSize = function(w, h) {
		this.bounds.setSize(w, h);
		this.clear();
	};
	
	QuadTreeNode.prototype.add = function(element) {
		if (!this.nodes.isEmpty()) {
			for (var i=0; i<this.nodes.length; i++) if (this.nodes[i].bounds.intersects(element.globalBounds)) this.nodes[i].add(element);
		} else {
			this.children.add(element);
			if ((this.children.length > jgui.geometry.QuadTree.MAXCHILDREN) && (this.depth < jgui.geometry.QuadTree.MAXDEPTH)) {
				this.subdivide();
				for (var i=0; i<this.children.length; i++) this.add(this.children[i]);
				this.children.clear();
				return;
			}
			this.tree.childrenAdded = this.tree.childrenAdded + 1;
		}
	};
	
	QuadTreeNode.prototype.subdivide = function() {
		if (!this.subrects) this.subrects = this.bounds.subdivide(0);
		this.nodes.add(new jgui.geometry.QuadTreeNode(this.tree, this.subrects[0], this.depth + 1));
		this.nodes.add(new jgui.geometry.QuadTreeNode(this.tree, this.subrects[1], this.depth + 1));
		this.nodes.add(new jgui.geometry.QuadTreeNode(this.tree, this.subrects[2], this.depth + 1));
		this.nodes.add(new jgui.geometry.QuadTreeNode(this.tree, this.subrects[3], this.depth + 1));
	};
	
	QuadTreeNode.prototype.clear = function(element) {
		this.nodes.clear();
		this.children.clear();
	};
	
	QuadTreeNode.prototype.nodeAt = function(x, y) {
		for (var i=0; i<this.nodes.length; i++) if (this.nodes[i].bounds.containsPoint(x, y)) return this.nodes[i];
	};
	
	QuadTreeNode.prototype.elementAt = function(x, y) {
		if (!this.nodes.isEmpty()) {
			var node = this.nodeAt(x, y);
			if (node) return node.elementAt(x, y);
		} else {
			for (var i=this.children.length - 1; i>=0; i--) {
				if (this.children[i].globalBounds.containsPoint(x, y)) {
					var localPoint = this.children[i].globalToLocal(x, y);
					if (this.children[i].localBounds.containsPoint(localPoint.x , localPoint.y)) {
						return this.children[i];
					}
				}
			}
		}
	};
	
	QuadTreeNode.prototype.paint = function(canvas) {
		for (var i=0; i<this.nodes.length; i++) this.nodes[i].paint(canvas);
		for (var i=0; i<this.children.length; i++) canvas.painter.fillRect(this.children[i].globalBounds, Color.named('yellow').opacity(0.05).toString());
		if (!this.children.isEmpty()) canvas.painter.fillRect(this.bounds, Color.named('red').opacity(0.1).toString());
		canvas.painter.drawRect(this.bounds, Color.named('yellow').opacity(0.5).toString());
	};
}());