(function() {
	function TransformStack() {
		this.__matrix = new jgui.geometry.Matrix();
		this.matrix = new jgui.geometry.Matrix();
	}
	
	TransformStack
		.extend(jgui.Object)
		.namespace("jgui.geometry.TransformStack")
		.properties('__stack', 'matrix');
	
	TransformStack.prototype.clear = function() {
		this.__matrix.reset(); this.matrix.reset(); return this;
	};
	
	TransformStack.prototype.push = function(transform) {
		this.__matrix.clone(this.matrix);
		this.matrix.invConcat(transform.matrix());
		return this;
	};
	
	TransformStack.prototype.pop = function() {
		this.matrix.clone(this.__matrix);
		return this;
	};
})();