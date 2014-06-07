(function() {
	function object() { }
	
	object.extend(Object).namespace('jgui.Object');
	
	/*object.hash = {};
	object.hash = function(obj) {
		if (!object.hash[obj.constructor.name]) object.hash[obj.constructor.name] = 0;
		object.hash[obj.constructor.name] = object.hash[obj.constructor.name] + 1;
		obj.hash = obj.constructor.name + object.hash[obj.constructor.name];
	};
	object.prototype.hashName = function() { return "$1($2)".format(this.name, this.hash); };*/
	
	object.prototype.copy = function() {
		var obj = new this.constructor; obj.clone(this);
		return obj;
	};
	
	object.prototype.clone = function(obj) {
		// beware of circular references, the copying will create infinite recursion - fix somehow?
		if (this.constructor != obj.constructor) throw '$1 cannot clone instance of $2'.format(Object.typeOf(this), Object.typeOf(obj));
		var propNames = this.constructor.propertyNames;
		for (var i=0; i<propNames.length; i++) {
			var name = propNames[i];
			var objVal = obj[name];
			if (objVal && objVal.copy) {
				this[name] = objVal.copy();
			} else {
				this[name] = objVal;
			}
		}
		return this;
	};
	
	object.prototype.equals = function(obj) {
		if (this.constructor != obj.constructor) return false;
		for (var i=0; i<this.constructor.propertyNames.length; i++) {
			var name = this.constructor.propertyNames[i];
			if (!obj[name])
				return false;
			if (this[name].equals && obj[name].equals) {
				if (!this[name].equals(obj[name]))
					return false;
			} else {
				if (this[name] != obj[name])
					return false;
			}
		}
		return true;
	};
})();
