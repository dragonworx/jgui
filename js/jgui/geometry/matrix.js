(function() {
	// [a, c ,tx]
	// [b, d, ty]
	// [alpha, 0, 1]
	function Matrix(a, b, c, d, tx, ty, alpha) {
		this.a = a ? a : 1;
		this.b = b ? b : 0;
		this.c = c ? c : 0;
		this.d = d ? d : 1;
		this.tx = tx ? tx : 0;
		this.ty = ty ? ty : 0;
		this.alpha = alpha ? alpha : 1;
	}
	
	Matrix
		.extend(jgui.Object)
		.namespace("jgui.geometry.Matrix")
		.properties('a', 'b', 'c', 'd', 'tx', 'ty', 'alpha');
	
	Matrix.prototype.reset = function() {
		this.a = 1;
		this.b = 0;
		this.c = 0;
		this.d = 1;
		this.tx = 0;
		this.ty = 0;
		this.alpha = 1;
		return this;
	};

	Matrix.prototype.concat = function(m) {
		var a = this.a;
		var b = this.b;
		var c = this.c;
		var d = this.d;
		var tx = this.tx;
		var ty = this.ty;
		var alpha = this.alpha;
		this.a = m.a * a + m.c * b;
		this.b = m.b * a + m.d * b;
		this.c = m.a * c + m.c * d;
		this.d = m.b * c + m.d * d;
		this.tx = m.a * tx + m.c * ty + m.tx;
		this.ty = m.b * tx + m.d * ty + m.ty;
		this.alpha = m.alpha * alpha;
		return this;
	};
	
	Matrix.prototype.invConcat = function(m) {
		var a = this.a * m.a + this.c * m.b;
		var b = this.b * m.a + this.d * m.b;
		var c = this.a * m.c + this.c * m.d;
		var d = this.b * m.c + this.d * m.d;
		var tx = this.a * m.tx + this.c * m.ty + this.tx;
		var ty = this.b * m.tx + this.d * m.ty + this.ty;
		var alpha = this.alpha * m.alpha;
		this.a = a;
		this.b = b;
		this.c = c;
		this.d = d;
		this.tx = tx;
		this.ty = ty;
		this.alpha = alpha;
		return this;
	};
	
	Matrix.prototype.concatRaw = function(array) {
		var ma = array[0];
		var mb = array[1];
		var mc = array[2];
		var md = array[3];
		var mtx = array[4];
		var mty = array[5];
		var a = this.a;
		var b = this.b;
		var c = this.c;
		var d = this.d;
		var x = this.tx;
		var y = this.ty;
		this.a = ma * a + mc * b;
		this.b = mb * a + md * b;
		this.c = ma * c + mc * d;
		this.d = mb * c + md * d;
		this.tx = ma * x + mc * y + mtx;
		this.ty = mb * x + md * y + mty;
		return this;
	};
	
	Matrix.prototype.determinant = function() {
		return this.a * this.d - this.b * this.c;
	};
	
	Matrix.prototype.inverse = function() {
		return this.copy().invert();
	};
	
	Matrix.prototype.invert = function() {
		var determinant = this.determinant();
		if (determinant == 0) return null;
		var det = 1 / determinant;
		var a = this.a;
		var b = this.b;
		var c = this.c;
		var d = this.d;
		var x = this.tx;
		var y = this.ty;
		this.a = d * det;
		this.b = -b * det;
		this.c = -c * det;
		this.d = a * det;
		this.tx = (c * y - x * d ) * det;
		this.ty = (x * b - a * y ) * det;
		return this;
	};
	
	Matrix.prototype.transformPoint = function(x, y) { return new jgui.geometry.Point(this.a * x + this.c * y + this.tx, this.b * x + this.d * y + this.ty); };
	Matrix.prototype.transformVector = function(x, y) { return new jgui.geometry.Point(this.a * x + this.c * y, this.b * x + this.d * y ); };
	
	Matrix.prototype.localToGlobal = function(x, y) { return this.transformPoint(x, y); };
	Matrix.prototype.globalToLocal = function(x, y) { return this.inverse().transformPoint(x, y); };
	
	Matrix.prototype.localToGlobal = function(x, y) { return this.transformPoint(x, y); return Matrix.point; };
	Matrix.prototype.globalToLocal = function(x, y) { return this.inverse().transformPoint(x, y); return Matrix.point; };
	
	Matrix.prototype.translate = function(x, y) { return this.concatRaw(Matrix.translateRaw(x, y)); };
	Matrix.prototype.rotate = function(deg) { return this.concatRaw(Matrix.rotateRaw(deg)); };
	Matrix.prototype.rotateAroundPoint = function(deg, x, y) { return this.concatRaw(Matrix.rotateAroundPointRaw(deg, x, y)); };
	Matrix.prototype.scale = function(x, y) { return this.concatRaw(Matrix.scaleRaw(x, y)); };
	
	Matrix.prototype.toString = function() { return "|$1, $2, $3|\n|$4, $5, $6|\n|0, 0, 1|".format(this.a, this.c, this.tx, this.b, this.d, this.ty); };
	
	// static methods
	Matrix.identity = function() { return new Matrix(); };
	Matrix.translate = function(x, y) { return new Matrix(1, 0, 0, 1, x, y); };
	Matrix.rotate = function(deg) {
		var r = jgui.geometry.radians(deg);
		if (r == 0) return new Matrix();
		var sin = Math.sin(r);
		var cos = Math.cos(r);
		return new Matrix(cos, sin, -sin, cos, 0, 0);
	};
	Matrix.rotateAboutPoint = function(deg, x, y) {
		var r = jgui.geometry.radians(deg);
		if (r == 0) return new Matrix();
		var sin = Math.sin(r);
		var cos = Math.cos(r);
		return new Matrix(cos, sin, -sin, cos, -cos * x + sin * y + x, -sin * x - cos * y + y);
	}
	Matrix.scale = function(x, y) { return new Matrix(x, 0, 0, y, 0, 0); };
	
	Matrix.identityRaw = function() { return [1, 0, 0, 1, 0, 0]; };
	Matrix.translateRaw = function(x, y) { return [1, 0, 0, 1, x, y]; };
	Matrix.rotateRaw = function(deg) {
		var r = jgui.geometry.radians(deg);
		if (r == 0) return Matrix.identityRaw();
		var sin = Math.sin(r);
		var cos = Math.cos(r);
		return [cos, sin, -sin, cos, 0, 0];
	};
	Matrix.rotateAboutPointRaw = function(deg, x, y) {
		var r = jgui.geometry.radians(deg);
		if (r == 0) return new Matrix();
		var sin = Math.sin(r);
		var cos = Math.cos(r);
		return [cos, sin, -sin, cos, -cos * x + sin * y + x, -sin * x - cos * y + y];
	}
	Matrix.scaleRaw = function(x, y) { return [x, 0, 0, y, 0, 0]; };
	
	Matrix.localSpaceTransform = function(origin, heading) {
		var h = heading.normalised();
		return new Matrix(h.x, h.y, -h.y, h.x, - h.x * origin.x + h.y * origin.y, - h.y * origin.x - h.x * origin.y);
	};
	Matrix.localSpaceTransformRaw = function(origin, heading) {
		var h = heading.normalised();
		return [h.x, h.y, -h.y, h.x, - h.x * origin.x + h.y * origin.y, - h.y * origin.x - h.x * origin.y];
	};
})();

function matrix(a, b, c, d, tx, ty) { return new jgui.geometry.Matrix(a, b, c, d, tx, ty); }
