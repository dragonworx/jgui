(function() {
	
	// opts: origin, translation, rotation, scale, skew, canvas
	
	function SceneTransform(scene) {
		jgui.geometry.Transform.apply(this, arguments);
		this.scene = scene
	}
	
	SceneTransform
		.extend(jgui.geometry.Transform)
		.namespace("jgui.geometry.SceneTransform")
		.properties('canvas');
	
	SceneTransform.prototype.matrix = function() {
		if (this.__dirty == true) {
			this.__matrix.reset();
			this.__matrix.translate(this.origin.x * -1, this.origin.y * -1);
			this.__matrix.scale(this.scale.x, this.scale.y);
			this.__matrix.rotate(this.rotation);
			this.__matrix.scale(this.skew.x, this.skew.y);
			this.__matrix.translate(this.translation.x, this.translation.y);
			this.__matrix.scale(this.scene.quality, this.scene.quality);
			this.__dirty = false;
		}
		return this.__matrix;
	};
	
	// canvas geometry
	SceneTransform.prototype.setCanvasSize = function() { this.scene.canvas.width = this.scene.width * this.scene.quality; this.scene.canvas.height = this.scene.height * this.scene.quality; return this; };
	SceneTransform.prototype.update = function() { this.__dirty = true; this.setCanvasSize(); };
	
	// geometry
	SceneTransform.prototype.localToGlobal = function(x, y) { return this.matrix().transformPoint(typeof(x) == "number" ? point(x, y) : x).scaled(this.width / (this.width * this.quality), this.height / (this.height * this.quality)); };
	
	SceneTransform.prototype.toString = function() { var str = jgui.geometry.Transform.invoke('toString', this, arguments) + " =($1,$2) %($3)"; return str.format(this.scene.width * this.scene.quality, this.scene.height * this.scene.quality, this.scene.quality); };
})();