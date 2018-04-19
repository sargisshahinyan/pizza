const sha = require("sha256");
const tokenGenerator = require("rand-token");
const mongoDb = {}; //new (require("../libs/mongoDb"))("users");
const conn = require('../libs/mysql');
const expDays = 5;

const table = '`users`';

class userTmp {
	constructor(params) {
		this.name = params.name;
		this.username = params.username;
		this.password = sha(params.password);
	}
}

class Users {
	static getUser(token = ''){
		return new Promise((resolve, reject) => {
			conn.query('SELECT * FROM tokens WHERE token = ?', [token], (err, rows) => {
				if(err) {
					reject(err);
					return;
				}
				
				if(!rows[0]) {
					reject({
						message: 'No token'
					});
					return;
				}
				
				const expDate = new Date(rows[0].expDate);
				
				if((new Date()) >= expDate) {
					reject({
						message: 'Token expired'
					});
					return;
				}
				
				const id = rows[0].userId;
				Users.getUserById(id).then(user => {
					user ? resolve(user) : reject({
						message: 'Invalid user id'
					});
				}, reject);
			})
		});
	}
	
	static getUserById(id) {
		return new Promise((resolve, reject) => {
			conn.query(`SELECT * FROM ${table} WHERE id = ?`, [id], (err, users) => {
				err ? reject(err) : resolve(users[0] || null);
			});
		});
	}
	
	static getUsers(limit = 20) {
		limit = parseInt(limit, 10);
		
		if(isNaN(limit) || limit < 0) {
			limit = 20;
		}
		
		return mongoDb.find([{}]);
	}
	
	static authUser(username, password) {
		password = sha(password);
		
		return new Promise((resolve, reject) => {
			conn.query(`SELECT id FROM ${table} WHERE username = ? AND password = ?`, [username, password], (err, rows) => {
				err ? reject(err) : resolve(rows[0] || null);
			});
		});
	}
	
	static setUserToken(id){
		const token = tokenGenerator.generate(64);
		
		let date = new Date();
		date.setDate(date.getDate() + expDays);
		
		return new Promise((resolve, reject) => {
			conn.query(`INSERT INTO tokens SET ?`, {
				userId: id,
				token: token,
				expDate: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
			}, err => err ? reject(err) : resolve(token));
		});
	}
	
	static addUser(data){
		return new Promise((resolve, reject) => {
			let newUser = new userTmp({
				name: data.name,
				username: data.username,
				password: data.password
			});
			
			conn.query(`INSERT INTO ${table} SET ?`, newUser, (err, res) => {
				if(err) {
					reject(err);
					return;
				}
				
				Users.getUserById(res.insertId).then(user => {
					user ? resolve(user) : reject({
						message: 'Invalid user id'
					});
				}, reject);
			});
		});
	}
	
	static editUser(data) {
		return new Promise((resolve, reject) => {
			mongoDb.update([{
				"tokens.token": data.token
			}, {
				$set: {
					name: data.name,
					username: data.username
				}
			}]).then(data => {
				resolve(data);
			}, error => {
				console.log(error);
				reject(error);
			});
		});
	}
	
	static changeUserPassword(data) {
		data.password = sha(data.password);
		
		return new Promise((resolve, reject) => {
			mongoDb.update([{
				"tokens.token": data.token
			}, {
				$set: {
					password: password
				}
			}]).then(data => {
				resolve(data);
			}, error => {
				console.log(error);
				reject(error);
			});
		});
	}
	
	static cryptPassword(password) {
		return sha(password);
	}
}

module.exports = Users;