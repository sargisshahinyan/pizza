const table = '`orders`';

const conn = require('../libs/mysql');
const Products = require('./products');

function modifyOrderResult(orders) {
	let promises = [];
	
	orders.forEach((order, i) => {
		promises[i] = new Promise((resolve, reject) => {
			conn.query('SELECT * FROM `orderDetails` WHERE orderId = ?', [order.id], (err, rows) => {
				if(err) {
					reject(err);
					return;
				}
				
				order.products = [];
				
				if(!rows.length) {
					resolve();
					return;
				}
				
				let promises = [];
				rows.forEach((detail, i) => {
					promises[i] = new Promise((resolve, reject) => {
						conn.query('SELECT * FROM `orderSubcategories` WHERE orderDetailId = ?', [detail.id], (err, rows) => {
							if(err) {
								reject(err);
								return;
							}
							
							Products.getProduct(detail.productId).then(product => {
								product.quantity = detail.quantity;
								product.instructions = detail.instructions;
								
								product.additions.forEach(function filter(add, i, arr) {
									let array = [];
									
									for(let type in add.children) {
										if(!add.children.hasOwnProperty(type)) {
											continue;
										}
										
										add.children[type] = add.children[type].filter((add, i, arr) => {
											if(add.children) {
												filter(add, i, arr);
												return typeof add.children !== 'undefined';
											}
											
											return rows.some(row => Number(row.subcategoryId) === Number(add.id));
										});
										
										if(!add.children[type].length) {
											delete add.children[type];
										} else {
											array.push(...add.children[type]);
										}
									}
									
									if(!Object.keys(add.children).length) {
										delete add.children;
										arr[i] = null;
									} else {
										add.children = array;
									}
								});
								
								product.additions = product.additions.filter(Boolean);
								
								order.products.push(product);
								resolve();
							});
						});
					});
				});
				
				Promise.all(promises).then(resolve, reject);
			});
		});
	});
	
	return Promise.all(promises).then(() => orders, err => Promise.reject(err));
}

class Orders {
	static getOrders(options) {
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
		
		return (new Promise((resolve, reject) => {
			conn.query(`SELECT
			 ${table}.\`id\`, \`date\`, \`firstName\`, \`lastName\`, \`email\`, \`phone\`, \`address1\`, \`address2\`, \`city\`, \`states\`.name as state
			 FROM ${table}
			 JOIN states ON states.id = ${table}.stateId
			 LIMIT ?, ?`, [options['skip'], options['limit']], (err, rows) => {
				err ? reject(err) : resolve(rows);
			});
		})).then(modifyOrderResult);
	}
	
	static getOrder(id) {
		return new Promise((resolve, reject) => {
			conn.query(`SELECT
			 ${table}.\`id\`, \`date\`, \`firstName\`, \`lastName\`, \`email\`, \`phone\`, \`address1\`, \`address2\`, \`city\`, \`states\`.name as state
			 FROM ${table}
			 JOIN states ON states.id = ${table}.stateId
			 WHERE ${table}.id = ?`, [id], (err, rows) => {
				err ? reject(err) : resolve(rows[0] || null);
			});
		}).then(modifyOrderResult).then(orders => orders[0]);
	}
	
	static addOrder(order) {
		return new Promise((resolve, reject) => {
			conn.query(`INSERT INTO ${table} SET ?`, {
				firstName: order.firstName,
				lastName: order.lastName,
				address1: order.address1,
				address2: order.address2,
				city: order.city,
				stateId: order.state,
			}, (err, res) => {
				if(err) {
					reject(err);
				}
				
				const id = parseInt(res.insertId, 10);
				
				if(Array.isArray(order.products) && order.products.length) {
					let promises = [];
					
					order.products.forEach(function (product, i) {
						promises[i] = new Promise((resolve, reject) => {
							conn.query('INSERT INTO `orderDetails` SET ?', {
								orderId: id,
								productId: product.id,
								quantity: product.quantity,
								instructions: product.instructions || null
							}, (err, res) => {
								if(err) {
									reject(err);
									return;
								}
								
								if(Array.isArray(product.adds) && product.adds.length) {
									const id = parseInt(res.insertId, 10);
									let promises = [];
									
									product.adds.forEach((add, i) => {
										promises[i] = new Promise((resolve, reject) => {
											conn.query('INSERT INTO `orderSubcategories` SET ?', {
												orderDetailId: id,
												subcategoryId: add
											}, err => {
												err ? reject(err) : resolve();
											});
										});
									});
									
									Promise.all(promises).then(resolve, reject);
								} else {
									resolve();
								}
							});
						});
					});
					
					Promise.all(promises).then(() => resolve(Orders.getOrder(id).then(order => resolve(order), error => reject(error))), err => reject(err));
				} else {
					resolve(Orders.getOrder(id).then(order => resolve(order), error => reject(error)));
				}
			});
		});
	}
	
	static editOrder(id, order) {
		const keys = ['name'];
		let sql = '',
			data = [];
		
		keys.forEach(key => {
			if(order[key]) {
				data.push(order[key]);
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
	
	static deleteOrder(id) {
		return new Promise((resolve, reject) => {
			conn.query(`DELETE FROM ${table} WHERE id = ?`, [id], (err, result) => {
				err ? reject(err) : resolve(result.affectedRows[0]);
			});
		});
	}
}

module.exports = Orders;