(function() {
	
	function EventDispatcher() {
		jgui.Object.apply(this, arguments);
		this.__listeners = new Dictionary();
	}
	
	EventDispatcher
		.extend(jgui.Object)
		.namespace("jgui.event.EventDispatcher")
		.properties('__listeners');
	
	EventDispatcher.prototype.addEvent = function(type, fn) {
		if (!this.__listeners.containsKey(type)) {
			this.__listeners[type] = new List();
			this.__listeners[type].enabled = true;
		}
		this.__listeners[type].push(fn);
		return this;
	};
	
	EventDispatcher.prototype.removeEvent = function(type, fn) {
		if (!this.__listeners.containsKey(type)) return this;
		this.__listeners[type].remove(fn);
		return this;
	};
	
	EventDispatcher.prototype.enableEvent = function(type) {
		if (!this.__listeners[type]) return this;
		this.__listeners[type].enabled = true;
		return this;
	};
	
	EventDispatcher.prototype.disableEvent = function(type) {
		if (!this.__listeners[type]) return this;
		this.__listeners[type].enabled = false;
		return this;
	};
	
	EventDispatcher.prototype.dispatchEvent = function(type, data) {
		if (!this.__listeners[type]) return this;
		if (this.__listeners[type].enabled)
			for (var i=0; i<this.__listeners[type].length; i++)
				this.__listeners[type][i](data);
		return this;
	};
})();
