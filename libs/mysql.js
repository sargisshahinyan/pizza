const mysql = require('mysql');
const config = require('../config/db');

const conn = mysql.createConnection(config);

module.exports = conn;