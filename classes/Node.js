let _data = Symbol('data');
let _children = Symbol('children');

class Node {
	constructor(data) {
		this[_data] = data;
		this[_children] = [];
	}
	
	getData() {
		return this[_data];
	}
	
	getChildren() {
		return this[_children];
	}
	
	addChild(data) {
		this[_children].push(new Node(data));
	}
	
	getChild(id) {
		for(let i = 0; i < this[_children].length; i++) {
			if(this[_children][i][_data].id === id) {
				return this[_children][i];
			}
			
			if(this[_children][i].getChildren().length) {
				let child = this[_children][i].getChild(id);
				
				if(child) {
					return child;
				}
			}
		}
		
		return null;
	}
}

module.exports = Node;