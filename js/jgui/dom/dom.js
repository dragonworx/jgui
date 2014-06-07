(function() {
	function dom() {}
	
	dom.extend(jgui.Object).namespace('jgui.dom');
	
	dom.offset = function(element) {
	    var body = document.body,
	        win = document.defaultView,
	        docElem = document.documentElement,
	        box = document.createElement('div');
	    box.style.paddingLeft = box.style.width = "1px";
	    body.appendChild(box);
	    var isBoxModel = box.offsetWidth == 2;
	    body.removeChild(box);
	    box = element.getBoundingClientRect();
	    var clientTop  = docElem.clientTop  || body.clientTop  || 0,
	        clientLeft = docElem.clientLeft || body.clientLeft || 0,
	        scrollTop  = win.pageYOffset || isBoxModel && docElem.scrollTop  || body.scrollTop,
	        scrollLeft = win.pageXOffset || isBoxModel && docElem.scrollLeft || body.scrollLeft;
	    return point(box.left + scrollLeft - clientLeft, box.top  + scrollTop  - clientTop);
	};
	
	dom.scroll = function() {
	    if(typeof pageYOffset != 'undefined'){
	        return point(pageXOffset, pageYOffset); //most browsers
	    } else {
	        var B = document.body; //IE 'quirks'
	        var D = document.documentElement; //IE with doctype
	        D = (D.clientHeight) ? D: B;
	        return point(D.scrollLeft, D.scrollTop);
	    }
	};
	
	dom.size = function(element) {
		if (element.clientWidth) return {'width':element.clientWidth,'height':element.clientHeight};
		return {'width':element.offsetWidth,'height':element.offsetHeight};
	};
	
	dom.obj = function(o) {return (o.obj) ? o.obj : o;};
	
	dom.addEvent = function() {};
	
	dom.removeEvent =function() {};
	
	dom.bindings = {};
	
	if (window.addEventListener) {
		dom.addEvent = function(ob, type, fn) {
			dom.obj(ob).addEventListener(type, fn, false);
			dom.bindings[dom.obj(ob)] = 1;
		};
		dom.removeEvent = function(ob, type, fn) {
			dom.obj(ob).removeEventListener(type, fn, false);;
		};
	} else if (document.attachEvent) {
		dom.addEvent = function(ob, type, fn) {
			var eProp = type + fn;
			var o = dom.obj(ob);
			o['e' + eProp] = fn;
			o[eProp] = function() {
				o['e' + eProp](window.event);
			};
			o.attachEvent('on' + type, o[eProp]);
		};
		dom.removeEvent = function(ob, type, fn) {
			var eProp = type + fn;
			var o = dom.obj(ob);
			o.detachEvent('on' + type, o[eProp]);
			o[eProp] = null;
			o["e" + eProp] = null;
		};
	}
})();
