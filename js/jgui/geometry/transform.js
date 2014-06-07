(function() {
	
	function Transform() {
		this.__matrix = new jgui.geometry.Matrix();
		this.origin = new jgui.geometry.Point();
		this.translation = new jgui.geometry.Point();
		this.rotation = 0;
		this.scale = new jgui.geometry.Point(1, 1);
		this.skew = new jgui.geometry.Point(1, 1);
		this.alpha = 0.8;
		this.__dirty = true;
	}
	
	Transform
		.extend(jgui.Object)
		.namespace("jgui.geometry.Transform")
		.properties('__matrix', 'origin', 'translation', 'rotation', 'scale', 'skew', 'alpha', '__dirty');
	
	Transform.prototype.matrix = function() {
		if (this.__dirty == true) {
			this.__matrix.reset();
			this.__matrix.translate(this.origin.x * -1, this.origin.y * -1);
			this.__matrix.scale(this.scale.x, this.scale.y);
			this.__matrix.rotate(this.rotation);
			this.__matrix.scale(this.skew.x, this.skew.y);
			this.__matrix.translate(this.translation.x, this.translation.y);
			this.__dirty = false;
		}
		return this.__matrix;
	};
	Transform.prototype.reset = function() {
		this.__matrix.reset();
		this.origin.x = 0; this.origin.y = 0;
		this.translation.x = 0; this.translation.y = 0;
		this.rotation = 0;
		this.scale.x = 1; this.scale.y = 1;
		this.skew.x = 1; this.skew.y = 1;
		this.__dirty = false;
		return this;
	}

	Transform.prototype.localToGlobal = function(x, y) { return this.matrix().localToGlobal(x, y); };
	Transform.prototype.globalToLocal = function(x, y) { return this.matrix().globalToLocal(x, y); };
	
	Transform.prototype.update = function() { this.__dirty = true; }
	
	Transform.prototype.toString = function() { return "@($1,$2) +($3,$4) o:$5 [$6,$7]*[$8,$9]".format(this.origin.x, this.origin.y, this.translation.x, this.translation.y, this.rotation, this.scale.x, this.scale.y, this.skew.x, this.skew.y); };
})();