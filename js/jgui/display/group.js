(function() {
	
	function Group() {
		jgui.display.Element.apply(this, arguments);
	}
	
	Group
		.extend(jgui.display.Element)
		.namespace("jgui.display.Group");
	
	// geometry
	Group.prototype.defaultSize = function() { return {width:0,height:0}; };
	
	// rendering, painting
	Group.prototype.renderGeometry = function(scene) {
		scene.pushTransform(this.transform);
		this.__matrix.clone(scene.currentTransform());
		
		for (var i=0; i<this.children.length; i++)
			this.children[i].renderGeometry(scene);
			
		scene.popTransform();
		
		var p = this.localToGlobal(0, 0);
		
		this.globalBounds.setLocation(p.x, p.y);
	};
	
	Group.prototype.paint = function(scene) {
		scene.setTransformMatrix(this.__matrix);
		
		if (scene.debug)
			scene.painter.drawPoint(this.transform.origin.x, this.transform.origin.y, this.style.foreground, 10, this.transform.rotation);
		
		for (var i=0; i<this.children.length; i++)
			this.children[i].paint(scene);
	};
})();