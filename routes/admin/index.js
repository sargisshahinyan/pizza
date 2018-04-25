const express = require('express');
const router = express.Router();

const functions = require('../../libs/functions');

// models
const Users = require('../../models/users');
const Categories = require('../../models/categories');
const Products = require('../../models/products');
const Orders = require('../../models/orders');

const baseUrl = '/admin';
const viewPath = 'admin';

router.use(function (req, res, next) {
	//local variables
	res.locals = {
		baseUrl: baseUrl,
		routes: {
			orders: {
				url: '/orders'
			},
			products: {
				url: '/products'
			},
			categories: {
				url: '/categories'
			}
		}
	};
	
	//make selected route active in view
	for(let r in res.locals.routes) {
		res.locals.routes[r].active = (req.path === ('/' + r));
	}
	
	//if client have no token redirect him to index page
	if(!req.cookies.token) {
		req.path === '/' || req.path === '/auth' ? next() : res.status(401).redirect(baseUrl);
		return;
	}
	
	//check user token
	Users.getUser(req.cookies.token).then(user => {
		if(user) {
			if(req.path !== '/') {
				res.locals.user = user;
				next();
			} else {
				res.redirect(baseUrl + '/orders');
			}
		} else {
			req.path === '/' || req.path === '/auth' ? next() : res.status(401).redirect(baseUrl);
		}
	}, () => {
		req.path === '/' || req.path === '/auth' ? next() : res.status(401).redirect(baseUrl);
	});
});

router.get('/', function(req, res) {
	res.render(`${viewPath}/index`, {
		message: ''
	});
});

router.post('/auth', function (req, res) {
	const data = req.body;
	
	const param = functions.getMissingParam({
		keys: ['username', 'password'],
		data: data
	});
	
	if(param) {
		res.status(403).render(`${viewPath}/index`, {
			message: `${param.replace(/^./, l => l.toUpperCase())} is missing`
		});
		return;
	}
	
	Users.authUser(data.username, data.password).then(user => {
		Users.setUserToken(user.id).then(token => {
			res.cookie('token', token, {
				httpOnly: true,
				expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5)
			}).redirect(301, baseUrl + '/orders');
		});
	}, () => {
		res.status(404).render(`${viewPath}/index`, {
			message: "Incorrect username or password"
		});
	});
});

router.get('/products', function (req, res) {
	Promise.all([Categories.getCategories(), Products.getProducts()]).then(result => {
		const categories = result[0],
			  products = result[1];
		
		res.render(`${viewPath}/products`, {
			categories,
			products
		});
	});
});

router.get('/orders', function (req, res) {
	Orders.getOrders().then(orders => {
		orders.forEach(order => {
			order.total = 0;
			
			Array.isArray(order.products) && order.products.forEach(product => {
				product.total = +product.additions.reduce(function sum(data, item) {
					return data + (Array.isArray(item.children) ? item.children.reduce(sum, 0) : parseFloat(item.price));
				}, 0).toFixed(2);
				
				order.total += product.total * product.quantity;
			});
		});
		
		res.render(`${viewPath}/orders`, {
			orders: orders
		});
	});
});

router.get('/categories', function (req, res) {
	Categories.getCategories().then((categories) => {
		res.render(`${viewPath}/categories`, {
			categories
		});
	}, error => console.log(error));
});

router.get('/logOut', function(req, res) {
	//Users.unsetToken(req.cookies.token).then(() => {
		res.clearCookie('token').redirect(301, baseUrl);
	//}, error => console.log(error));
});

module.exports = router;