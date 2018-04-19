const express = require('express');
const router = express.Router();

// models
const Users = require('../models/users');

const baseUrl = '/admin';

router.use(function (req, res, next) {
	if(
		req.method === 'GET' && (req.path.indexOf('/categories') === 0 || req.path.indexOf('/products') === 0) ||
		req.method === 'POST' && (req.path.indexOf('/orders') === 0)
	) {
		next();
		return;
	}
	
	//if client have no token redirect him to index page
	if(!req.cookies.token) {
		req.path === '/' || req.path === '/auth' ? next() : res.redirect(baseUrl);
		return;
	}
	
	//check user token
	Users.getUser(req.cookies.token).then(user => {
		if(user) {
			res.locals.user = user;
			next();
		} else {
			res.status(403).json({
				"message": "Invalid token"
			});
		}
	}, () => {
		res.status(500).end();
	});
});

router.use('/categories', require('./categories'));
router.use('/products', require('./products'));
router.use('/orders', require('./orders'));

module.exports = router;