Function.prototype.scope = function(thisObject) {
	var $this = this;
	return function() {$this.apply(thisObject, arguments)};
};

Function.prototype.namespace = function(namespace) {
	this.namespace = namespace;
	var names = namespace.split('.');
	var obj = window;
	for (var i=0; i<names.length; i++) {
		var name = names[i];
		if (!obj[name]) {
			if (i == names.length - 1)
				obj[name] = this;
			else
				obj[name] = {};
		}
		obj = obj[name];
	}
	return this;
};

Function.prototype.extend = function(superClass) {
	try {
		this.prototype = superClass == Object ? new Object() : Object.copy(superClass.prototype);
		this.base = superClass;
		this.prototype.constructor = this;
		this.propertyNames = new List();
		if (superClass.propertyNames)
			this.propertyNames.addAll(superClass.propertyNames);
		return this;
	} catch (e) {
		debugger;
	}
};

Function.prototype.properties = function() {
	this.propertyNames.addAll(arguments);
};

/********* Object **********/

Object.copy = function(obj) {
	var copy = {};
	for (var key in obj) {
		copy[key] = obj[key].copy ? obj[key].copy() : obj[key];
		/*try {
			if (obj[key].copy)
				copy[key] = obj[key].copy;
			else
				copy[key] = obj[key];
			} catch (e) {
				console.log(e);
				continue;
			}
		}*/
	}
	return copy;
};

Object.typeOf = function(value) {
	if (value == null) return null;
	if (value == undefined) return undefined;
	switch (typeof value) {
		case "object":
			return value.constructor.name;
		case "function":
			return value.name;
		default:
			return (typeof value).capitalise();
	}
};

Object.classOf = function(value) {
	if (value == null) return null;
	if (value == undefined) return undefined;
	switch (typeof value) {
		case "object":
			return value.constructor;
		case "function":
			return value;
		default:
			return (typeof value).capitalise();
	}
};

Object.properties = function(value) { var props = {}; for (var key in value) if (typeof(value[key]) != "function") props[key] = value[key]; return props; };

/********** String *********/

String.prototype.capitalise = function() { if ((this.charCodeAt(0) >= 97) && (this.charCodeAt(0) <= 122)) return String.fromCharCode(this.charCodeAt(0) - 32) + this.substring(1); }
String.prototype.trim = function() { return this.replace(/^\s+|\s+$/g, ''); };
String.prototype.format = function() { var output = this; for (var i=0; i<arguments.length; i++) output = output.replace("$" + (i + 1), arguments[i]); return output; }

/********** List ***********/

function List(obj) {
	this.constructor = List;
	if (obj) this.clone(obj);
}
List.prototype = new Array();
List.prototype.clone = function(list) {
	if (list instanceof Array) {
		this.clear();
		for (var i=0; i<list.length; i++) this.push(list[i].copy ? list[i].copy() : list[i]);
	} else { throw "List cannot clone a non-Array";	}
	return this;
};
List.prototype.copy = function() {
	var list = new List();
	list.clone(this);
	return list;
};
List.prototype.equals = function(list) {
	if (this == list) return true;
	if (!(list instanceof this.constructor) || (this.length != list.length)) return false;
	for (var i=0; i<this.length; i++) {
		if (this[i].equals) {
			if (!this[i].equals(list[i])) return false;
		} else {
			if (this[i] != list[i]) return false;
		}
	}
	return true;
};
List.prototype.each = function(fn) {
	var scope = {_done:false, _return:undefined, out:function(_return) {this._return = _return; this._done = true; }};
	for (var i=0; i<this.length; i++) {
		if (scope._done) return scope._return;
		else fn.call(scope, this[i], i);
	}
	return scope._return; 
};
List.prototype.reverseEach = function(fn) {
	var scope = {_done:false, _return:undefined, out:function(_return) {this._return = _return; this._done = true; }};
	for (var i=this.length-1; i>=0; i--) {
		if (scope._done) return scope._return;
		else fn.call(scope, this[i], i);
	}
	return scope._return; 
};
List.prototype.add = function(item) { this.push(item); return this; };
List.prototype.addAll = function(list) { for (var i=0; i<list.length; i++) this.push(list[i]); return this; };
List.prototype.insert = function(item) { this.splice(0, 0, item); return this; };
List.prototype.insertAt = function (item, index) { this.splice(index, 0, item); return this; };
List.prototype.first = function () { return this[0]; };
List.prototype.last = function () { return this[this.length - 1]; };
List.prototype.indexOf = function (item) { for (var i=0; i<this.length; i++) if (this[i] == item) return i; return -1; };
List.prototype.contains = function (item) { for (var i=0; i<this.length; i++) if (this[i] == item) return true; return false; };
List.prototype.isEmpty = function () { return this.length == 0; };
List.prototype.insertBefore = function (newItem, beforeItem) { this.insertAt(this.indexOf(beforeItem), newItem); return this; };
List.prototype.insertAfter = function (newItem, afterItem) { this.insertAt(this.indexOf(afterItem) + 1, newItem); return this; };
List.prototype.remove = function (item) { for (var i=0; i<this.length; i++) if (this[i] == item) this.removeAt(i); return this;};
List.prototype.removeAt = function (from, to) { var rest = this.slice((to || from) + 1 || this.length); this.length = from < 0 ? this.length + from : from; return this.push.apply(this, rest); };
List.prototype.clear = function() { this.length = 0; return this; };
List.prototype.count = function() { return this.length; };
List.prototype.ubound = function () { return this.length - 1; };
List.prototype.fill = function(type, count) { for (var i=0; i<count; i++) this.push(new type()); return this; };
List.prototype.clearFill = function() { for (var i=0; i<this.length; i++) this[i].clear(); };
List.prototype.isFillEmpty = function() { for (var i=0; i<this.length; i++) if (!this[i].isEmpty()) return false; return true; };
List.prototype.reverse = function() { var list = new List(); for (var i=this.length-1; i>=0; i--) list.push(this[i]); this.clear(); this.addAll(list); return this; }
function list(obj) { return new Dictionary(obj); }

/********** Dictionary ***********/

function Dictionary(obj) {
	this.constructor = Dictionary;
	if (obj) this.clone(obj);
}
Dictionary.prototype = new Array();
Dictionary.prototype.clone = function(obj) {
	this.clear();
	switch (Object.classOf(obj)) {
		case Object:
			for (var key in obj) this[key] = obj[key];
			break;
		case Dictionary:
			var keys = obj.keys();
			for (var key in keys) this[key] = obj[key];
			break;
	}
	return this;
}
Dictionary.prototype.copy = function() { return new Dictionary(this.toArray()); };
Dictionary.prototype.equals = function(dict) {
	if (this == dict) return true;
	if (!(dict instanceof this.constructor) || (this.count() != dict.count())) return false;
	if (!this.keys().equals(dict.keys())) return false;
	if (!this.values().equals(dict.values())) return false;
	return true;
};
Dictionary.prototype.get = function(name, defaultValue) { return this[name] ? this[name] : defaultValue; };
Dictionary.prototype.require = function(name, context) { if (!this[name]) { console.warn('"$1" option required for $2 constructor'.format(name, Object.typeOf(context))); throw 'option missing';} return this[name]; };
Dictionary.prototype.keys = function() { var array = new List(); for (var key in this) if (!this.constructor.prototype[key]) array.add(key); return array; };
Dictionary.prototype.values = function() { var array = new List(); for (var key in this) if (!this.constructor.prototype[key]) array.add(this[key]); return array; };
Dictionary.prototype.count = function() { var count = 0; for (var key in this) if (!this.constructor.prototype[key]) count++; return count; };
Dictionary.prototype.contains = function(item) { return this.values().contains(item); };
Dictionary.prototype.containsKey = function(key) { return this.keys().contains(key); };
Dictionary.prototype.remove = function(obj) { for (var key in this) if (this[key] == obj) {delete this[key]; return this;} };
Dictionary.prototype.removeKey = function(key) { delete this[key]; return this; }
Dictionary.prototype.clear = function() { for (var key in this) if (!this.constructor.prototype[key]) delete this[key]; return this; };
Dictionary.prototype.toArray = function() { var obj = {}; for (var key in this) if (!this.constructor.prototype[key]) obj[key] = this[key]; return obj; };
function dictionary(obj) { return new Dictionary(obj); }

/********* Global functions **********/

function inspect() {
	var a = [];
	for (var i=0; i<arguments.length; i++) a.push(arguments[i]);
	alert(a.join("\n"));
}

function $id(id) { return document.getElementById(id); };