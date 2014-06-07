(function() {
	function geometry() {}
	
	geometry.extend(jgui.Object).namespace("jgui.geometry");
	
	geometry.radians = function(deg) { return deg * (Math.PI / 180); };
	geometry.degrees = function(rad) { return rad * (180 / Math.PI); };
	
	geometry.polarPoint = function (deg, length) {
	    var x = length * Math.cos(jgui.geometry.radians(deg));
	    var y = length * Math.sin(jgui.geometry.radians(deg));
	    return new jgui.geometry.Point(x, y);
	};
	
	geometry.test = function() {
		// this scope will equal window (global)
		// do not use 'var name', use 'this.name' so eval in test functions will have same scope when applied to window
		var test = new Benchmark(jgui.geometry);
		
		// build object test cases
		test.category('radians, degrees');
		test.assert("jgui.geometry.radians(1) == 0.017453292519943295", true);
		test.assert("jgui.geometry.degrees(jgui.geometry.radians(1)) == 1", true);
		
		// run tests
		test.complete();
	};
})();