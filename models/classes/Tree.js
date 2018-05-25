const Node = require('./Node');
const _mainNodes = Symbol('mainNodes');

class Tree {
	constructor() {
		this[_mainNodes] = [];
	}
	
	addNode(node, data) {
		if(node === null) {
			this[_mainNodes].push(new Node(data));
			return;
		}
		
		node.addChild(data);
	}
	
	getNode(id) {
		for(let i = 0; i < this[_mainNodes].length; i++) {
			if(this[_mainNodes][i].getData().id === id) {
				return this[_mainNodes][i];
			}
			
			let node = this[_mainNodes][i].getChild(id);
			
			if(node) return node;
		}
		
		return null;
	}
	
	getGroupedTree() {
		return this[_mainNodes].map(function find(node) {
			let data = node.getData();
			
			const children = node.getChildren();
			
			if(children.length) {
				data.children = children.map(find).reduce((data, item) => {
					data[item.type] = data[item.type] || [];
					data[item.type].push(item);
					
					return data;
				}, {});
			}
			
			return data;
		});
	}
}

module.exports = Tree;