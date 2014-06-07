(function() {
	function Painter() {
		this.subpixel = true;
		this.filters = new List();
		this.canvas = undefined;
		this.context = undefined;
		this.width = 0;
		this.height = 0;
	}
	
	Painter
		.extend(jgui.Object)
		.namespace('jgui.display.Painter')
		.properties('subpixel', 'width', 'height', 'filters');
	
	Painter.prototype.copy = function() {
		var obj = new this.constructor; obj.clone(this);
		obj.createCanvas();
		obj.setSize(this.width, this.height);
		return obj;
	};
	
	Painter.prototype.createCanvas = function() {
		this.canvas = document.createElement('canvas');
		this.context = this.canvas.getContext('2d');
		this.canvas.style.position = 'absolute';
		this.setSize(this.width, this.height);
		return this.canvas;
	};
	
	Painter.prototype.setCanvasId = function(id) {
		this.canvas.setAttribute('id', id);
		return this;
	};
	
	Painter.prototype.setSize = function(w, h, canvasWidth, canvasHeight) {
		this.width = w; this.height = h;
		if (this.canvas) {
			this.canvas.width = canvasWidth ? canvasWidth : w;
			this.canvas.height = canvasHeight ? canvasHeight : h;
			this.canvas.style.width = Math.round(this.width) + 'px';
			this.canvas.style.height = Math.round(this.height) + 'px';
		}
		return this;
	};
	
	Painter.prototype.addFilter = function(filter) { this.filters.add(filter); filter.painter = this; return this; };
	
	Painter.prototype.applyFilters = function() { for (var i=0; i<this.filters.length; i++) this.filters[i].apply(); return this; };
	
	Painter.prototype.setTransform = function(m) { this.context.setTransform(m.a, m.b, m.c, m.d, m.tx, m.ty); return this; };
	Painter.prototype.clearTransform = function(m) { this.context.setTransform(1, 0, 0, 1, 0, 0); return this; };
	
	Painter.prototype.blend = function() { return this.context.globalAlpha / 100; };
	Painter.prototype.setBlend = function(alpha) { this.context.globalAlpha = Math.max(0, Math.min(1.0, alpha)); return this; };
	
	Painter.prototype.sharpen = function(value) { return Math.round(value) + 0.5; };
	
	Painter.prototype.setClipRect = function(x, y, w, h) {
		if (Object.classOf(x) == jgui.geometry.Rectangle) {
			y = x.y;
			w = x.width;
			h = x.height;
			x = x.x;
		}
		if (!this.subpixel) {
			x = this.sharpen(x);
			y = this.sharpen(y);
			w = this.sharpen(w);
			h = this.sharpen(h);
		}
		this.context.beginPath();
		this.context.rect(x, y, w, h);
		this.context.clip();
		this.context.closePath();
		return this;
	};
	
	Painter.prototype.drawPoint = function(x, y, strokeColor, radius, deg) {
		if (Object.classOf(x) == jgui.geometry.Point) {
			strokeColor = y;
			radius = strokeColor;
			deg = radius;
			y = x.y;
			x = x.x;
		}
		if (!this.subpixel) {
			x = this.sharpen(x);
			y = this.sharpen(y);
			radius = this.sharpen(radius);
		}
		deg = deg == 0 ? 0 : deg % 360;
		radius = radius ? radius : 5;
		var rad2 = radius;
		this.context.beginPath();
		this.context.moveTo(x, y - rad2);
		this.context.lineTo(x, y + rad2);
		this.context.moveTo(x - rad2, y);
		this.context.lineTo(x + rad2, y);
		this.context.strokeStyle = strokeColor ? strokeColor : this.style.foreground;
		this.context.closePath();
		this.context.stroke();
		this.context.beginPath();
		this.context.moveTo(x, y);
		this.context.arc(x, y, radius, 0, jgui.geometry.radians(deg));
		this.context.lineTo(x, y);
		this.context.stroke();
		this.context.closePath();
		return this;
	};
	
	Painter.prototype.drawLine = function(x1, y1, x2, y2, strokeColor, width) {
		if (Object.classOf(x1) == jgui.geometry.Line) {
			strokeColor = y1;
			width = x2;
			y1 = x1.y1;
			x2 = x1.x2;
			y2 = x1.y2;
			x1 = x1.x1;
		}
		if (!this.subpixel) {
			x1 = this.sharpen(x1);
			y1 = this.sharpen(y1);
			x2 = this.sharpen(x2);
			y2 = this.sharpen(y2);
		}
		this.context.beginPath();
		this.context.moveTo(x1, y1);
		this.context.lineTo(x2, y2);
		this.context.strokeStyle = strokeColor ? strokeColor : this.style.foreground;
		this.context.lineWidth = width ? width : 1;
		this.context.stroke();
		this.context.closePath();
		return this;
	};
	
	Painter.prototype.drawRect = function(x, y, w, h, color, width) {
		if (Object.classOf(x) == jgui.geometry.Rectangle) {
			color = y;
			y = x.y;
			w = x.width;
			h = x.height;
			x = x.x;
		}
		if (!this.subpixel) {
			x = this.sharpen(x);
			y = this.sharpen(y);
			w = this.sharpen(w);
			h = this.sharpen(h);
		}
		this.context.beginPath();
		this.context.rect(x, y, w, h);
		this.context.lineWidth = width ? width : 1;
		this.context.strokeStyle = color ? color : this.style.foreground;
		this.context.stroke();
		this.context.closePath();
		return this;
	};
	
	Painter.prototype.fillRect = function(x, y, w, h, color) {
		if (Object.classOf(x) == jgui.geometry.Rectangle) {
			color = y;
			y = x.y;
			w = x.width;
			h = x.height;
			x = x.x;
		}
		if (!this.subpixel) {
			x = this.sharpen(x);
			y = this.sharpen(y);
			w = this.sharpen(w);
			h = this.sharpen(h);
		}
		this.context.beginPath();
		this.context.fillStyle = color ? color : this.style.background;
		this.context.rect(x, y, w, h);
		this.context.fill();
		this.context.closePath();
		return this;
	};
	
	Painter.prototype.drawDebugRect = function(x, y, w, h, fillColor, strokeColor) {
		if (Object.classOf(x) == jgui.geometry.Rectangle) {
			fillColor = y;
			y = x.y;
			w = x.width;
			h = x.height;
			x = x.x;
		}
		if (fillColor)
			this.fillSolidRect(x, y, w, h, fillColor);
		if (strokeColor) {
			this.drawRect(x, y, w, h, strokeColor);
			this.drawLine(x, y, x + w, y + h, strokeColor);
			this.drawLine(x + w, y, x, y + h, strokeColor);
			/*this.drawLine(x, y + (h * 0.25), x + (w * 0.025), y + (h * 0.025), strokeColor);
			this.drawLine(x + (w * 0.025), y + (h * 0.025), x + (w * 0.25), y, strokeColor);*/
		}
		return this;
	};
	
	Painter.prototype.fillSolidRect = function(x, y, w, h, fillColor) {
		if (Object.classOf(x) == jgui.geometry.Rectangle) {
			fillColor = y;
			y = x.y;
			w = x.width;
			h = x.height;
			x = x.x;
		}
		if (!this.subpixel) {
			x = this.sharpen(x);
			y = this.sharpen(y);
			w = this.sharpen(w);
			h = this.sharpen(h);
		}
		this.context.fillStyle = fillColor;
		this.context.fillRect(x, y, w, h);
		
		this.context.beginPath();
		this.context.moveTo(x + w, y);
		this.context.quadraticCurveTo(x + w, y + h, x + w - (w * 0.75), y + h);
		this.context.lineTo(x + w, y + h);
		this.context.lineTo(x + w, y);
		this.context.fillStyle = Color.fromString(fillColor).darken(0.25).toString();
		this.context.fill();
		this.context.closePath();
		
		this.context.beginPath();
		this.context.moveTo(x, y + h);
		this.context.lineTo(x, y);
		this.context.lineTo(x + (w * 0.75), y);
		this.context.quadraticCurveTo(x, y, x, y + h);
		this.context.lineTo(x, y + h);
		this.context.fillStyle = Color.fromString(fillColor).lighten(0.25).toString();
		this.context.fill();
		this.context.closePath();
		return this;
	}
	
	Painter.prototype.clear = function() { this.clearTransform(); this.clearRect(0, 0, this.canvas.width, this.canvas.height); return this; };
	Painter.prototype.clearRect = function(x, y, w, h) { this.context.clearRect(x, y, w, h); return this; };
	
	Painter.prototype.push = function() { this.context.save(); return this; };
	Painter.prototype.pop = function() { this.context.restore(); return this; };
	
	Painter.prototype.apply = function() { this.context.fill(); this.context.stroke(); return this; };
	Painter.prototype.fill = function() { this.context.fill(); return this; };
	Painter.prototype.stroke = function() { this.context.stroke(); return this; };
})();
