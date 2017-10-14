
//定义事件中心；
function Emiter (){
	var listener = [];
	function add (key, fn){
		if(listener.indexOf(key) === -1){
			listener.push(key);
			listener[key]=[];
			listener[key].push(fn);
		}
		if(listener[key].indexOf(fn) === -1){
			listener[key].push(fn);
		}
	}
	function trigger (key, args, fn){
		if(listener.indexOf(key) !== -1){
			if(fn){
				if(listener[key].indexOf(fn) !== -1){
					fn.apply(fn,args);
				}
			}else{
				listener[key].forEach(function(fni){
					fni.apply(fni,args);
				});
			}		
		}
	}
	function off(key, fn){
		if (listener.indexOf(key) !== -1){
			if (fn){
				if (listener[key].indexOf(fn) !== -1){
					listener[key].splice(listener[key].indexOf(fn), 1);
				}
			}else{
				listener[key] = [];
			}
		}
	}
	return {
		//listener: listener,
		on: add,
		off: off,
		trigger: trigger
	}
}
//定义分割字符串的函数
function textToArray(text){
	var arrOfText = [];
	var length = text.length;
	arrOfText = text.split(/{(?={)|}(?=})/);
	arrOfText = arrOfText.map(function(str){
		if (str[0] === '{'){
			return {
					tag: true,
					value: str.slice(1)
					};
		}
		if (str[0] === '}'){
			return {value: str.slice(1)};
		}
		if(str){
			return {value: str};
		}
	});
	return arrOfText;
}
function parseDom(el, obj, emiter){
	var reg = /{{[^{^}]*}}/;
	parse(el);
	function parse (el){
		if(el.nodeType === 1){
			parseEvent(el);
		}
		if(el.nodeType === 3){
			parseData(el);
		}
		if(el.childNodes.length !== 0){
			[].forEach.call(el.childNodes, function(node){
				parse(node);
			});
		}
	}
	function parseData(el){
		if (!el.nodeValue){return};
		if(reg.test(el.nodeValue)){
			el._text_ = textToArray(el.nodeValue);
			binding(el, obj, emiter)
		}
	}
	function parseEvent(el){
		var data = el.dataset,
			eventName = data.event,
			exp = data.val;
		el.addEventListener(eventName, function(e){
			setval(exp, el.value);
		}, false);
	}
	function setval(exp, val){
		var arkey = exp.split('.');
		iter(arkey, obj);
		function iter(arkey, obj){
			if(arkey.length === 1){
				obj[arkey[0]] = val;
			}else{
				iter(arkey.slice(1), obj[arkey[0]]);
			}
		}
	}
}
function binding (el, obj, emiter){
	var subs = el._text_;
	var vals = subs.map(function(obj){
		if(obj.tag){
			emiter.on('top.' + obj.value, update);
			return getval(obj.value);
		}
		return obj.value;
	});
	
	function getval(exp){
		var arkey = exp.split('.');
		return iter(arkey, obj);
		function iter(arkey, obj){
			if(arkey.length !== 1){
				return iter(arkey.slice(1), obj[arkey[0]]);
			}
			return obj[arkey[0]];
		}
	}

	function update(){
		vals = subs.map(function(obj){
				if(obj.tag){
					emiter.on('top.' + obj.value, update);
					return getval(obj.value);
				}
				return obj.value;
			});
		console.log('我要更新了');
		el.nodeValue = vals.join('');
	}
	update();
}

//定义Vue
var $vue = function (obj){
	this.data = obj.data;
	this.el = document.querySelectorAll(obj.el)[0];
	this.binds = [];
	this.emiter = Emiter();
	console.log(this.emiter);
	this.nodes = document.querySelectorAll(obj.el);
	this.htmls = [].map.call(this.nodes, function(node){
		return node.innerHTML;
	});
	parseDom(this.el, this.data, this.emiter);
	this.convertf(obj.data);
}
var proto = $vue.prototype;
// 定义对象转换的方法。
proto.convertf = function (obj){
	var self = this;
	function convertf (obj) {
		function subConvertf (key, val){	
			Object.defineProperty(obj, key, {	
				enumerable: true,
				configurable: true,
				get: function (){
					// console.log('你访问了' + key + ":" +val);
					return val;
				},
				set: function (newval){
					// console.log('你设置了' + key);
					console.log('新的' + key + ' = ' + newval);

					if (typeof newval === 'object'){
						convertf(newval);
					}
					if (newval === val) return;
					val = newval;
					var parentPath = obj._parent_path_;
					//console.log ('parantPath is:' + parentPath);
					self.$trigger(parentPath + '.' + key, [val]);
				}
			});
		}

		for (var key in obj){
			if (obj.hasOwnProperty(key) && key !== '_parent_path_'){
				if (typeof obj[key] === "object"){
					obj[key]._parent_path_ = (function(){
						if(!obj._parent_path_){
							obj._parent_path_ = 'top';
						}
						var newpath = obj._parent_path_ + '.' + key;
						// console.log(newpath);
						return newpath;
					}());
					convertf(obj[key]);
				}
				subConvertf(key, obj[key]);
			}
		}
		
		return obj;
	}

	convertf(obj);
}
// 定义添加监听事件的方法；
proto.$watch = function (key, fn){
	console.log(this);
	var key = 'top'? key : 'top.' + key;
	this.emiter.on(key, fn);
}
proto.$trigger = function (key, args, fn){
	// console.log(this);
	var emiter = this.emiter;
	// console.log(emiter);
	bubble(key);
	function bubble (key){
		var arkey = key.split('.');
		iter(arkey);
		function iter(arkey){
			if(arkey.length !== 0){
				var newkey = arkey.join(".");
				// console.log('newkey is:' + newkey);
				emiter.trigger(newkey, args, fn);
				arkey.pop();

				iter(arkey);
			}
		}
	}
}



