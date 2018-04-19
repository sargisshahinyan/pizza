const express = require('express');
const router = express.Router();

// models
const Categories = require('../models/categories');
const Products = require('../models/products');
const functions = require('../libs/functions');
const States = require('../models/states');

router.use(function(req, res, next) {
	Categories.getCategories().then(categories => {
		res.locals.categories = categories;
		res.locals.basket = parseInt(req.cookies.count) || 0;
		next();
	});
});

router.get('/', function(req, res) {
	Products.getProducts().then(products => {
		let newProducts = [];
		
		res.locals.categories.forEach(category => {
			newProducts.push({
				category: category.category,
				products: products.filter(product => product.categoryId === category.id)
			});
			products = products.filter(product => product.categoryId !== category.id);
		});
		
		products = newProducts;
		
		res.render('index', {
			products
		});
	});
});

router.get('/contact', function(req, res) {
	res.render('contact');
});

router.get('/menu-single', function(req, res) {
	res.render('menu-single');
});

router.get('/menu-classic', function(req, res) {
	res.render('menu-classic');
});

router.get('/item/:id', function(req, res) {
	const id = req.params.id;
	
	if(!functions.checkId(id)) {
		res.status(404).send("Invalid id");
		return;
	}
	
	Products.getProduct(id).then(product => {
		res.render('shop-single', {
			product
		});
	});
});

router.get('/cart', function(req, res) {
	States.getStates().then(states => {
		res.render('shop-cart', {
			states
		});
	});
});

// const nodemailer = require('nodemailer');
// router.get('/email', function(req, res) {
// 	let transporter = nodemailer.createTransport({
// 		host: 'smtp.mailtrap.io',
// 		port: 2525,
// 		secure: false,
// 		auth: {
// 			user: 'bfd4e8e52df6e1',
// 			pass: 'ce3f3e52d9d7b7'
// 		}
// 	});
//
// 	let mailOptions = {
// 		from: 'app86463378@heroku.com',
// 		to: 'shahinyan.sargis@gmail.com, sargissss@mail.ru',
// 		subject: 'Testing',
// 		text: 'Hello world?'
// 	};
//
// 	transporter.sendMail(mailOptions, (error, info) => {
// 		if (error) {
// 			console.log(error);
// 			res.send(error);
// 		} else {
// 			console.log('Email sent: ' + info.response);
// 			res.send(info.response);
// 		}
// 	});
// });

module.exports = router;
