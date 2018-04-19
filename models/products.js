const table = '`products`';
const Tree = require('../classes/Tree');

const conn = require('../libs/mysql');

function modifyProduct(product) {
	let tree = new Tree();
	let items = [];
	let i = 0;
	
	return new Promise((resolve, reject) => {
		conn.query('SELECT * FROM `prices` WHERE productId = ?', [product.id], (err, rows) => {
			if (err) reject(err);
			if (!rows.length) {
				product.additions = [];
				resolve();
				return;
			}
			
			process();
			
			function process() {
				getSubcategory(rows[i].subcategoryId).then(function add(item) {
					items.unshift(item);
					
					if(item.parentId) {
						getSubcategory(item.parentId).then(add);
					} else {
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
							product.additions = tree.getGroupedTree();
							resolve();
						} else {
							process();
						}
					}
				});
			}
		});
	});
}

function getSubcategory(parentId) {
	return new Promise((resolve, reject) => {
		conn.query('SELECT * FROM `subcategories` WHERE id = ?', [parentId], (err, rows) => {
			if(err) reject(err);
			
			resolve(rows[0]);
		});
	});
}

class Products {
	static getProducts(options) {
		const keys = ['limit', 'skip'];
		const defaults = {
			skip: 0,
			limit: 20
		};
		
		if(typeof options !== 'object') {
			options = {};
		}
		
		keys.forEach(key => {
			options[key] = !isNaN(parseInt(options[key], 10)) ? parseInt(options[key], 10) : defaults[key];
		});
		
		return new Promise((resolve, reject) => {
			conn.query(`SELECT
						${table}.id, ${table}.name, categoryId,
						description, image, categories.name as categoryName
						FROM ${table} JOIN categories
						ON ${table}.categoryId = categories.id
						ORDER BY categoryId LIMIT ?, ?`, [options['skip'], options['limit']], (err, rows) => {
				if(err) reject(err);
				if(!rows.length) {
					resolve([]);
					return;
				}
				
				let i = 0;
				
				modifyProduct(rows[i]).then(function f() {
					i++;
					
					if(i === rows.length) {
						resolve(rows);
					} else {
						modifyProduct(rows[i]).then(f);
					}
				})
			});
		});
	}
	
	static getProduct(id) {
		return new Promise((resolve, reject) => {
			conn.query(`SELECT
						${table}.id, ${table}.name, categoryId,
						description, image, categories.name as categoryName
						FROM ${table} JOIN categories
						ON ${table}.categoryId = categories.id WHERE ${table}.id = ?`, [id], (err, rows) => {
				if(err) {
					reject(err);
					return;
				}
				
				modifyProduct(rows[0]).then(() => {
					resolve(rows[0]);
				});
			});
		});
	}
	
	static addProduct(product) {
		return new Promise((resolve, reject) => {
			conn.query(`INSERT INTO ${table} SET ?`, {
				name: product.name || '',
				description: product.description || '',
				categoryId: product.categoryId || '',
				image: product.image || ''
			}, (err, res) => {
				if(err) {
					reject(err);
				}
				
				Products.getProduct(res.insertId).then(c => resolve(c), err => reject(err));
			});
		});
	}
	
	static editProduct(id, item) {
		const keys = ['name', 'description', 'categoryId', 'image'];
		let sql = '',
			data = [];
		
		keys.forEach(key => {
			if(item[key]) {
				data.push(item[key]);
				sql += `${key} = ?,`;
			}
		});
		
		if(!sql) {
			return Promise.reject({
				'message': 'Bad request'
			});
		}
		
		sql = sql.substr(0, sql.length - 1);
		data.push(id);
		
		return new Promise((resolve, reject) => {
			conn.query(`UPDATE ${table} SET ${sql} WHERE id = ?`, data, (err, result) => {
				err ? reject(err) : resolve(result.changedRows[0]);
			});
		});
	}
	
	static deleteProduct(id) {
		return new Promise((resolve, reject) => {
			conn.query(`DELETE FROM ${table} WHERE id = ?`, [id], (err, result) => {
				err ? reject(err) : resolve(result.affectedRows[0]);
			});
		});
	}
}

module.exports = Products;