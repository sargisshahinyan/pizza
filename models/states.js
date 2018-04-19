const table = '`states`';

const conn = require('../libs/mysql');

class States {
	static getStates() {
		return new Promise((resolve, reject) => {
			conn.query(`SELECT * FROM ${table} ORDER BY name`, function(err, rows) {
				err ? reject(err) : resolve(rows);
			})
		});
	}
	static getState(id) {
		return new Promise((resolve, reject) => {
			conn.query(`SELECT * FROM ${table} WHERE id = ?`, [id], function(err, rows) {
				if(err) {
					reject(err);
					return;
				}
				
				rows.length ? resolve(rows[0]) : reject("Empty result");
			})
		});
	}
}

module.exports = States;