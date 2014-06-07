(function() {
	function Line(x1, y1, x2, y2) {
		this.x1 = x1 ? x1 : 0;
		this.y1 = y1 ? y1 : 0;
		this.x2 = x2 ? x2 : 0;
		this.y2 = y2 ? y2: 0;
	}
	
	Line
		.extend(jgui.Object)
		.namespace("jgui.geometry.Line")
		.properties('x1', 'y1', 'x2', 'y2');
	
	Line.prototype.at = function (value) { return new jgui.geometry.Point(this.x1 + ((this.x2 - this.x1) * value), this.y1 + ((this.y2 - this.y1) * value)); };
	
	Line.prototype.angle = function () {
		var deg = jgui.geometry.degrees(Math.atan2(this.y2 - this.y1, this.x2 - this.x1));
	    if (deg < 0) deg = 180 + (180 - Math.abs(deg));
	    return deg;
	};
	Line.prototype.length = function () {
		var x = Math.abs(this.x2 - this.x1);
	    var y = Math.abs(this.y2 - this.y1);
	    return Math.sqrt((y * y) + (x * x));
	};
	
	Line.prototype.toString = function() { return "line($1,$2,$3,$4)".format(this.x1, this.y1, this.x2, this.y2); };
})();

function line(x1, y1, x2, y2) { return new jgui.geometry.Line(x1, y1, x2, y2); }
