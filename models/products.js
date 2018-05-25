const table = '`products`';
const conn = require('../libs/mysql');

const Subcategories = require('./classes/Subcategories');

class Products {
	static getProducts(options) {
		const keys = ['limit', 'skip', 'categoryId'];
		const defaults = {
			skip: 0,
			limit: 20,
			categoryId: '%'
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
						description, ${table}.image, categories.name as categoryName
						FROM ${table} JOIN categories
						ON ${table}.categoryId = categories.id
						WHERE ${table}.categoryId LIKE ?
						ORDER BY categoryId LIMIT ?, ?`, [options['categoryId'], options['skip'], options['limit']], (err, rows) => {
				if(err) {
					reject(err);
					return;
				}
				if(!rows.length) {
					resolve([]);
					return;
				}
				
				let i = 0;
				
				Subcategories.addSubcategories(rows[i], '`prices`', '`productId`').then(function f() {
					i++;
					
					if(i === rows.length) {
						resolve(rows);
					} else {
						Subcategories.addSubcategories(rows[i], '`prices`', '`productId`').then(f);
					}
				});
			});
		});
	}
	
	static getProduct(id) {
		return new Promise((resolve, reject) => {
			conn.query(`SELECT
						${table}.id, ${table}.name, categoryId,
						description, ${table}.image, categories.name as categoryName
						FROM ${table} JOIN categories
						ON ${table}.categoryId = categories.id WHERE ${table}.id = ?`, [id], (err, rows) => {
				if(err) {
					reject(err);
					return;
				}
				
				Subcategories.addSubcategories(rows[0], '`prices`', '`productId`').then(() => {
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