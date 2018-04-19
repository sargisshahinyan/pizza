class functions{
	static getMissingParam(args) {
		if(typeof args !== "object") {
			return "server";
		}
		
		let data = args.data;
		let keys = args.keys;
		
		if(!(keys instanceof Array) || typeof data !== "object") {
			return "server";
		}
		
		for(let i = 0; i < keys.length; ++i) {
			if(!data[keys[i]] && parseInt(data[keys[i]]) !== 0) {
				return keys[i];
			}
		}
		
		return null;
	};
	
	static trim(obj) {
		let data = Object.assign({}, obj);
		
		if(typeof data === 'object') {
			for (let prop in data) {
				if (typeof data[prop] === 'string')
					data[prop] = data[prop].replace(/^[\r\n\s]/, '').replace(/[\r\n\s]$/, '');
			}
		}
		
		return data;
	}
	
	static checkId(id) {
		return typeof id === "string" && (/^\w{24}$/.test(id) || /^\d+$/.test(id));
	}
}

module.exports = functions;