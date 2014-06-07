(function() {
	function Point(x, y) {
		this.x = x ? x : 0;
		this.y = y ? y : 0;
	};
	
	Point
		.extend(jgui.Object)
		.namespace("jgui.geometry.Point")
		.properties('x', 'y');
	
	Point.prototype.rotate = function (deg, aroundPoint) {
		var radians = jgui.geometry.radians(deg);
		var s = Math.sin(radians);
		var c = Math.cos(radians);
		if (aroundPoint) {
		    var x = this.x;
		    var y = this.y;
		    x -= aroundPoint.x;
		    y -= aroundPoint.y;
		    var xnew = x * c - y * s;
		    var ynew = x * s + y * c;
		    this.x = xnew + aroundPoint.x;
		    this.y = ynew + aroundPoint.y;
		} else {
			this.x = x * c - y * s;
			this.y = x * s + y * c;
		}
		return this;
	};
	
	Point.prototype.normalised = function() { var l = this.length(); return new jgui.geometry.Point(this.x / l, this.y / l); };
	Point.prototype.length = function() { return Math.sqrt((this.y * this.y) + (this.x * this.x)); };
	
	Point.prototype.setXY = function(x, y) { this.x = x; this.y = y; return this; }
	Point.prototype.setX = function(x) { this.x = x; return this; }
	Point.prototype.setY = function(y) { this.y = y; return this; }
	Point.prototype.plus = function(x, y) {
		if (x instanceof Point) return new Point(this.x + x.x, this.y + x.y);
		return new Point(this.x + point.x, point.y ? this.y + point.y : this.y); 
	};
	Point.prototype.plusX = function(x) { return new Point(this.x + x, this.y); };
	Point.prototype.plusY = function(y) { return new Point(this.x, this.y + y); };
	Point.prototype.minus = function(x, y) { return this.plus(x * -1, y * -1); };
	Point.prototype.minusX = function(x) { return this.plusX(x * -1); };
	Point.prototype.minusY = function(y) { return this.plusY(y * -1); };
	Point.prototype.scale = function (xscale, yscale) { this.x = this.x * xscale; this.y = this.y * (yscale ? yscale : xscale); return this; };
	Point.prototype.scaled = function (xscale, yscale) { return new Point(this.x * xscale, this.y * (yscale ? yscale : xscale)); };
	Point.prototype.to = function(point) { return new jgui.geometry.Line(this.x, this.y, point.x, point.y); };
	Point.prototype.corner = function(point) { return jgui.geometry.Rectangle(this, point); };
	Point.prototype.ceil = function() { return new Point(Math.ceil(this.x), Math.ceil(this.y)); };
	Point.prototype.floor = function() { return new Point(Math.floor(this.x), Math.floor(this.y)); };
	Point.prototype.travel = function(deg, length) { var p = jgui.geometry.polarPoint(deg, length); return this.plus(p); }
	
	Point.prototype.toString = function() { return "point(" + this.x + "," + this.y + ")"; };
	Point.prototype.toShortString = function() { return this.x + "," + this.y; };
})();

function point(x, y) { return new jgui.geometry.Point(x, y); }