const Tree = require('./Tree');
const conn = require('../../libs/mysql');

class Subcategories {
	constructor(_conn) {
		this.conn = _conn;
	}
	
	getSubcategory(parentId) {
		return new Promise((resolve, reject) => {
			this.conn.query('SELECT * FROM `subcategories` WHERE id = ?', [parentId], (err, rows) => {
				if(err) reject(err);
				
				resolve(rows[0]);
			});
		});
	}
	
	addSubcategories(object, table, field) {
		let tree = new Tree();
		let items = [];
		let i = 0;
		
		return new Promise((resolve, reject) => {
			this.conn.query(`SELECT * FROM ${table} WHERE ${field} = ?`, [object.id], (err, rows) => {
				if (err) reject(err);
				if (!rows.length) {
					object.additions = [];
					resolve();
					return;
				}
				
				let process = () => {
					this.getSubcategory(rows[i].subcategoryId).then(function add(item) {
						items.unshift(item);
						
						if(item.parentId) {
							let parent = tree.getNode(parseInt(item.parentId));
							
							if(parent) {
								items.unshift(parent.getData());
							} else {
								this.getSubcategory(item.parentId).then(add.bind(this));
								return;
							}
						}
						
						items[items.length - 1].price = rows[i].price;
						items.forEach((item, i) => {
							if(tree.getNode(item.id) !== null){
								return;
							}
							
							tree.addNode(i ? tree.getNode(items[i - 1].id) : null, item);
						});
						items = [];
						i++;
						
						if(i === rows.length) {
							object.additions = tree.getGroupedTree();
							resolve();
						} else {
							process();
						}
					}.bind(this));
				};
				
				process();
			});
		});
	}
}

const subcategory = new Subcategories(conn);
module.exports = subcategory;