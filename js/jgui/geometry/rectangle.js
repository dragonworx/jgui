(function() {
	function Rectangle(x, y, w, h) {
		this.x = x ? x : 0;
		this.y = y ? y : 0;
		this.width = w ? w : 0;
		this.height = h ? h : 0;
	}
	
	Rectangle
		.extend(jgui.Object)
		.namespace('jgui.geometry.Rectangle')
		.properties('x', 'y', 'width', 'height');
	
	Rectangle.prototype.set = function(x, y, width, height) { this.x = x; this.y = y; this.width = width; this.height = height; return this; };
	Rectangle.prototype.clear = function() { this.x = this.y = this.width = this.height = 0; return this; };
	Rectangle.prototype.isEmpty = function() { return (this.x == 0) && (this.y == 0) && (this.width == 0) && (this.height == 0); };
	
	Rectangle.prototype.location = function() { return new jgui.geometry.Point(this.x, this.y); }
	Rectangle.prototype.corner = function() { return new jgui.geometry.Point(this.x + this.width, this.y + this.height); }
	Rectangle.prototype.setLocation = function(x, y) { this.x = x; this.y = y; return this; };
	Rectangle.prototype.move = function(x, y) { this.x += x; this.y += y; return this; };
	Rectangle.prototype.setCorner = function(x, y) { this.width = x - this.x; this.height = y - this.y; this.sort(); return this; };
	Rectangle.prototype.setWidth = function(w) { this.width = w; return this; }
	Rectangle.prototype.setHeight = function(h) { this.height = h; return this; }
	Rectangle.prototype.top = function() { return this.y; }
	Rectangle.prototype.setTop = function(y) { this.y = y; this.sort(); return this; }
	Rectangle.prototype.left = function() { return this.x; }
	Rectangle.prototype.setLeft = function(x) { this.x = x; this.sort(); return this; }
	Rectangle.prototype.right = function() { return this.x + this.width; }
	Rectangle.prototype.setRight = function(x) { this.width = x - this.x; this.sort(); return this; }
	Rectangle.prototype.bottom = function() { return this.y + this.height; }
	Rectangle.prototype.setBottom = function(y) { this.height = y - this.y; this.sort(); return this; }
	Rectangle.prototype.topLeft = Rectangle.prototype.location;
	Rectangle.prototype.bottomRight = Rectangle.prototype.corner;
	Rectangle.prototype.topRight = function () { return new jgui.geometry.Point(this.x + this.width, this.y); };
	Rectangle.prototype.bottomLeft = function () { return new jgui.geometry.Point(this.x, this.y + this.height); };
	Rectangle.prototype.setSize = function(w, h) { this.width = w; this.height = h; return this; };
	Rectangle.prototype.scale = function(w, h) { h = h ? h : w; this.x = this.x * w; this.y = this.y * h; this.width = this.width * w; this.height = this.height * h; return this; };
	Rectangle.prototype.scaleSize = function(w, h) { h = h ? h : w; this.width = this.width * w; this.height = this.height * h; return this; };
	Rectangle.prototype.round = function() { this.x = Math.round(this.x); this.y = Math.round(this.y); this.width = Math.round(this.width); this.height = Math.round(this.height); return this; };
	Rectangle.prototype.floor = function() { this.x = Math.floor(this.x); this.y = Math.floor(this.y); this.width = Math.floor(this.width); this.height = Math.floor(this.height); return this; };
	Rectangle.prototype.ceil = function() { this.x = Math.ceil(this.x); this.y = Math.ceil(this.y); this.width = Math.ceil(this.width); this.height = Math.ceil(this.height); return this; };
	
	Rectangle.prototype.center = function () { return new jgui.geometry.Point(this.x + this.width / 2, this.y + this.height / 2); };
	Rectangle.prototype.setCenter = function(point) { var w = this.width / 2; var h = this.height / 2; this.x = point.x - w; this.y = point.y - h; return this; };
	Rectangle.prototype.leftSide = function () { return new jgui.geometry.Line(this.x, this.y, this.x, this.y + this.height); };
	Rectangle.prototype.rightSide = function () { return new jgui.geometry.Line(this.x + this.width, this.y, this.x + w, this.y + this.height); };
	Rectangle.prototype.topSide = function () { return new jgui.geometry.Line(this.x, this.y, this.x, this.y + this.height); };
	Rectangle.prototype.bottomSide = function () { return new jgui.geometry.Line(this.x, this.y, this.x, this.y + this.height); };
	Rectangle.prototype.primaryDiagonal = function () { return this.location().to(this.corner()); };
	Rectangle.prototype.secondaryDiagonal = function () { return this.location().plusY(this.height()).to(this.location().plusX(this.width())); };
	Rectangle.prototype.centerVertical = function () { return this.topSide().at(0.5).to(this.bottomSide().at(0.5)); };
	Rectangle.prototype.centerHorizontal = function () { return this.leftSide().at(0.5).to(this.rightSide().at(0.5)); };
	Rectangle.prototype.hypotenuse = Rectangle.prototype.primaryDiagonal;
	
	Rectangle.prototype.containsPoint = function (x, y) {
	    if ((x < this.x) || (x > this.x + this.width)) return false;
	    if ((y < this.y) || (y > this.y + this.height)) return false;
	    return true;
	};
	
	Rectangle.prototype.inflate = function(width, height) {
		var x = this.x;
		var y = this.y;
		var w = this.width;
		var h = this.height;
		this.x = x - width;
		this.y = y - height;
		this.width = this.width + (width * 2);
		this.height = this.height + (height * 2);
		return this;
	};
	
	Rectangle.prototype.encompass = function() { // accepts variable amounts of points through arguments array
		var xmin = 100000;
		var ymin = 100000;
		var xmax = -100000;
		var ymax = -100000;
		for (var i=0; i<arguments.length; i++) {
			var p = arguments[i];
			xmin = Math.min(p.x, xmin);
			ymin = Math.min(p.y, ymin);
			xmax = Math.max(p.x, xmax);
			ymax = Math.max(p.y, ymax);
		}
		this.x = xmin;
		this.y = ymin;
		this.width = xmax - xmin;
		this.height = ymax - ymin;
		return this;
	};
	
	Rectangle.prototype.union = function(rect) {
		if (this.isEmpty()) {
			this.x = rect.x;
			this.y = rect.y;
			this.width = rect.width;
			this.height = rect.height;
			return this;
		}
		var l = Math.min(this.x, rect.x);
		var t = Math.min(this.y, rect.y);
		var r = Math.max(this.x + this.width, rect.x + rect.width);
		var b = Math.max(this.y + this.height, rect.y + rect.height);
		this.x = l;
		this.y = t;
		this.width = r - l;
		this.height = b - t;
		return this;
	};
	
	Rectangle.prototype.intersects = function(rect) {
		return (this.left() <= rect.right() &&
          rect.left() <= this.right() &&
          this.top() <= rect.bottom() &&
          rect.top() <= this.bottom());
	};
	
	Rectangle.prototype.subdivide = function(border) {
		border = border ? border : 0;
		var w = (this.width / 2) - border;
		var h = (this.height / 2) - border;
		var array = [];
		array.push(new jgui.geometry.Rectangle(this.x + border, this.y + border, w, h));
		array.push(new jgui.geometry.Rectangle(this.x + border + w, this.y + border, w, h));
		array.push(new jgui.geometry.Rectangle(this.x + border, this.y + border + h, w, h));
		array.push(new jgui.geometry.Rectangle(this.x + border + w, this.y + border + h, w, h));
		return array;
	};
	
	Rectangle.prototype.sort = function() {
		if (this.right() < this.x) {
			var x = this.x;
			this.x = this.right();
			this.width = x - this.x;
		}
		if (this.bottom() < this.y) {
			var y = this.y;
			this.y = this.bottom();
			this.height = y - this.y;
		}
		return this;
	};
	
	Rectangle.prototype.toString = function() { 
		return "rect($1,$2,$3,$4)".format(this.x, this.y, this.width, this.height); 
	};
})();

function rect(x, y, w, h) { return new jgui.geometry.Rectangle(x, y, w, h); }
