class Product {
	constructor(product) {
		this.product = product;
	}
	
	calculate(data) {
		let list = [];
		
		data.subdata.forEach(function collect(add) {
			if(add.children) {
				add.children.forEach(collect);
			} else {
				list.push(add.id);
			}
		});
		
		let sum = this.product.additions.reduce(function sum(data, item) {
			if(typeof item.children === 'object') {
				for(let type in item.children) {
					if(!item.children.hasOwnProperty(type)) {
						continue;
					}
					
					data += item.children[type].reduce(sum, 0);
				}
				
				return data;
			}
			
			return list.some(id => id === item.id) ? data + parseFloat(item.price) : data;
		}, 0);
		
		sum *= parseInt(data.quantity) || 1;
		
		return sum;
	}
}
