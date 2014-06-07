window.Color = (function() {
	function Color() {}
	
	Color.RED = 'red';
	Color.GREEN = 'green';
	Color.BLUE = 'blue';
	Color.ALPHA = 'alpha';
	
	Color.red = 0;
	Color.green = 0;
	Color.blue = 0;
	Color.alpha = 1;
	
	Color.namespace('jgui.display.Color');
	
	Color.component = function(type) {
		if (type == Color.RED) return Color.red;
		if (type == Color.GREEN) return Color.green;
		if (type == Color.BLUE) return Color.blue;
		if (type == Color.ALPHA) return Color.alpha;
	}
	
	Color.clamp = function(value, type) {
		return (type == Color.ALPHA) ? Math.max(0, Math.min(1, value)) : Math.max(0, Math.min(255, value));
	};

	Color.rgb = function(r, g, b) {
		Color.red = Color.clamp(r);
		Color.green = Color.clamp(g);
		Color.blue = Color.clamp(b);
		return Color;
	};
	
	Color.rgba = function(r, g, b, a) {
		Color.red = Color.clamp(r);
		Color.green = Color.clamp(g);
		Color.blue = Color.clamp(b);
		Color.alpha = Color.clamp(a);
		return Color;
	};
	
	Color.opacity = function(alpha) { Color.alpha = alpha; return Color; };
	
	Color.fromString = function(str) {
		if (str.charAt(0) == '#') return Color.fromHex(str);
		else return Color.fromRgba(str);
	};
	
	Color.fromHex = function(hex) {
		hex = hex.replace(/^#/, '');
		while (hex.length < 6) hex += '0';
		Color.red = parseInt(hex.substring(0, 2), 16);
		Color.green = parseInt(hex.substring(2, 4), 16);
		Color.blue = parseInt(hex.substring(4, 6), 16);
		return Color;
	};
	
	Color.fromRgba = function(rgba) {
		var components = rgba.match(/[0-9]+/g);
		Color.red = parseInt(components[0]);
		Color.green = parseInt(components[1]);
		Color.blue = parseInt(components[2]);
		Color.alpha = parseInt(components[3]);
		return Color;
	}
	
	Color.named = function(name) {
		var color = Color.names[name];
		if (color) {
			Color.red = color[0];
			Color.green = color[1];
			Color.blue = color[2];
		}
		return Color;
	}
	
	Color.random = function(alpha) { Color.rgba(Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), alpha ? alpha : 1); return Color; };
	
	Color.adjusted = function(amount) { Color.clamp(Color.red * amount); Color.clamp(Color.green * amount); Color.clamp(Color.blue * amount); return Color; };
	Color.lighten = function(amount) { Color.blend(amount, 255, 255, 255, 1); return Color; };
	Color.darken = function(amount) { Color.blend(amount, 0, 0, 0, 1); return Color; };
	Color.blend = function(amount, r, g, b, a) {
		a = a ? a : 1;
		Color.red = this.red + ((r - this.red) * a * amount);
		Color.green = this.green + ((g - this.green) * a * amount);
		Color.blue = this.blue + ((b - this.blue) * a * amount);
		return Color;
	};
	
	Color.toLongString = function() { return "$1 $2 '$3'".format(Color.toHex(), Color.toRgba(), Color.name()); };
	Color.toRgb = function() { return "rgb($1,$2,$3)".format(Math.round(Color.red), Math.round(Color.green), Math.round(Color.blue)); };
	Color.toRgba = function() { return "rgba($1,$2,$3,$4)".format(Math.round(Color.red), Math.round(Color.green), Math.round(Color.blue), Color.alpha); };
	Color.toHex = function() { return '#$1$2$3'.format(Color.toHexComponent(Color.red), Color.toHexComponent(Color.green), Color.toHexComponent(Color.blue)); };
	Color.toString = Color.toRgba;
	Color.valueOf = Color.toString;
	
	Color.toHexComponent = function(component) {
		if (component == null) return "00";
		component = parseInt(component);
		if (component == 0 || isNaN(component)) return "00";
		component = Color.clamp(component);
		component = Math.round(component);
		return "0123456789abcdef".charAt((component - component % 16) / 16) + "0123456789abcdef".charAt(component % 16);
	};
	
	Color.name = function() {
		for (var name in Color.named) if (Color.red == Color.named[name][0] & Color.green == Color.named[name][1] & Color.blue == Color.named[name][2]) return name;
		return '';
	};
	
	Color.names = {
	  aliceblue:  [240,248,255],
	  antiquewhite: [250,235,215],
	  aqua: [0,255,255],
	  aquamarine: [127,255,212],
	  azure:  [240,255,255],
	  beige:  [245,245,220],
	  bisque: [255,228,196],
	  black:  [0,0,0],
	  blanchedalmond: [255,235,205],
	  blue: [0,0,255],
	  blueviolet: [138,43,226],
	  brown:  [165,42,42],
	  burlywood:  [222,184,135],
	  cadetblue:  [95,158,160],
	  chartreuse: [127,255,0],
	  chocolate:  [210,105,30],
	  coral:  [255,127,80],
	  cornflowerblue: [100,149,237],
	  cornsilk: [255,248,220],
	  crimson:  [220,20,60],
	  cyan: [0,255,255],
	  darkblue: [0,0,139],
	  darkcyan: [0,139,139],
	  darkgoldenrod:  [184,134,11],
	  darkgray: [169,169,169],
	  darkgreen:  [0,100,0],
	  darkgrey: [169,169,169],
	  darkkhaki:  [189,183,107],
	  darkmagenta:  [139,0,139],
	  darkolivegreen: [85,107,47],
	  darkorange: [255,140,0],
	  darkorchid: [153,50,204],
	  darkred:  [139,0,0],
	  darksalmon: [233,150,122],
	  darkseagreen: [143,188,143],
	  darkslateblue:  [72,61,139],
	  darkslategray:  [47,79,79],
	  darkslategrey:  [47,79,79],
	  darkturquoise:  [0,206,209],
	  darkviolet: [148,0,211],
	  deeppink: [255,20,147],
	  deepskyblue:  [0,191,255],
	  dimgray:  [105,105,105],
	  dimgrey:  [105,105,105],
	  dodgerblue: [30,144,255],
	  firebrick:  [178,34,34],
	  floralwhite:  [255,250,240],
	  forestgreen:  [34,139,34],
	  fuchsia:  [255,0,255],
	  gainsboro:  [220,220,220],
	  ghostwhite: [248,248,255],
	  gold: [255,215,0],
	  goldenrod:  [218,165,32],
	  gray: [128,128,128],
	  green:  [0,128,0],
	  greenyellow:  [173,255,47],
	  grey: [128,128,128],
	  honeydew: [240,255,240],
	  hotpink:  [255,105,180],
	  indianred:  [205,92,92],
	  indigo: [75,0,130],
	  ivory:  [255,255,240],
	  khaki:  [240,230,140],
	  lavender: [230,230,250],
	  lavenderblush:  [255,240,245],
	  lawngreen:  [124,252,0],
	  lemonchiffon: [255,250,205],
	  lightblue:  [173,216,230],
	  lightcoral: [240,128,128],
	  lightcyan:  [224,255,255],
	  lightgoldenrodyellow: [250,250,210],
	  lightgray:  [211,211,211],
	  lightgreen: [144,238,144],
	  lightgrey:  [211,211,211],
	  lightpink:  [255,182,193],
	  lightsalmon:  [255,160,122],
	  lightseagreen:  [32,178,170],
	  lightskyblue: [135,206,250],
	  lightslategray: [119,136,153],
	  lightslategrey: [119,136,153],
	  lightsteelblue: [176,196,222],
	  lightyellow:  [255,255,224],
	  lime: [0,255,0],
	  limegreen:  [50,205,50],
	  linen:  [250,240,230],
	  magenta:  [255,0,255],
	  maroon: [128,0,0],
	  mediumaquamarine: [102,205,170],
	  mediumblue: [0,0,205],
	  mediumorchid: [186,85,211],
	  mediumpurple: [147,112,219],
	  mediumseagreen: [60,179,113],
	  mediumslateblue:  [123,104,238],
	  mediumspringgreen:  [0,250,154],
	  mediumturquoise:  [72,209,204],
	  mediumvioletred:  [199,21,133],
	  midnightblue: [25,25,112],
	  mintcream:  [245,255,250],
	  mistyrose:  [255,228,225],
	  moccasin: [255,228,181],
	  navajowhite:  [255,222,173],
	  navy: [0,0,128],
	  oldlace:  [253,245,230],
	  olive:  [128,128,0],
	  olivedrab:  [107,142,35],
	  orange: [255,165,0],
	  orangered:  [255,69,0],
	  orchid: [218,112,214],
	  palegoldenrod:  [238,232,170],
	  palegreen:  [152,251,152],
	  paleturquoise:  [175,238,238],
	  palevioletred:  [219,112,147],
	  papayawhip: [255,239,213],
	  peachpuff:  [255,218,185],
	  peru: [205,133,63],
	  pink: [255,192,203],
	  plum: [221,160,221],
	  powderblue: [176,224,230],
	  purple: [128,0,128],
	  red:  [255,0,0],
	  rosybrown:  [188,143,143],
	  royalblue:  [65,105,225],
	  saddlebrown:  [139,69,19],
	  salmon: [250,128,114],
	  sandybrown: [244,164,96],
	  seagreen: [46,139,87],
	  seashell: [255,245,238],
	  sienna: [160,82,45],
	  silver: [192,192,192],
	  skyblue:  [135,206,235],
	  slateblue:  [106,90,205],
	  slategray:  [112,128,144],
	  slategrey:  [112,128,144],
	  snow: [255,250,250],
	  springgreen:  [0,255,127],
	  steelblue:  [70,130,180],
	  tan:  [210,180,140],
	  teal: [0,128,128],
	  thistle:  [216,191,216],
	  tomato: [255,99,71],
	  turquoise:  [64,224,208],
	  violet: [238,130,238],
	  wheat:  [245,222,179],
	  white:  [255,255,255],
	  whitesmoke: [245,245,245],
	  yellow: [255,255,0],
	  yellowgreen:  [154,205,50]
	};

	return Color;
})();

window.Colors = {}; for (var name in window.Color.names) window.Colors[name] = window.Color.named(name).toHex();