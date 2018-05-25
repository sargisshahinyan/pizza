const table = '`categories`';
const conn = require('../libs/mysql');

const Subcategories = require('./classes/Subcategories');

class Categories {
	static getCategories(options) {
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
			conn.query(`SELECT * FROM ${table} LIMIT ?, ?`, [options['skip'], options['limit']], (err, rows) => {
				err ? reject(err) : resolve(rows);
			});
		});
	}
	
	static getCategory(id) {
		return new Promise((resolve, reject) => {
			conn.query(`SELECT * FROM ${table} WHERE id = ?`, [id], (err, rows) => {
				if(err) reject(err);
				
				Subcategories.addSubcategories(rows[0], '`categoryPrices`', '`categoryId`').then(() => {
					resolve(rows[0]);
				});
			});
		});
	}
	
	static addCategory(category) {
		return new Promise((resolve, reject) => {
			conn.query(`INSERT INTO ${table} SET ?`, {
				name: category.name
			}, (err, res) => {
				if(err) {
					reject(err);
				}
				
				Categories.getCategory(res.insertId).then(c => resolve(c), err => reject(err));
			});
		});
	}
	
	static editCategory(id, category) {
		const keys = ['name'];
		let sql = '',
			data = [];
		
		keys.forEach(key => {
			if(category[key]) {
				data.push(category[key]);
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
	
	static deleteCategory(id) {
		return new Promise((resolve, reject) => {
			conn.query(`DELETE FROM ${table} WHERE id = ?`, [id], (err, result) => {
				err ? reject(err) : resolve(result.affectedRows[0]);
			});
		});
	}
}

module.exports = Categories;