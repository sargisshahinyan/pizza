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

function calculateTotal(products) {
	products.forEach(product => {
		product.total = product.additions.reduce(function sum(data, item) {
			if(typeof item.children === 'object' && parseInt(item.selected, 10)) {
				for(let type in item.children) {
					if(!item.children.hasOwnProperty(type)) {
						continue;
					}
					
					data += item.children[type].reduce(sum, 0);
				}
				
				return data;
			}
			
			return parseInt(item.selected, 10) ? data + parseFloat(item.price) : data;
		}, 0);
	});
	
	return products;
}

function groupProducts(products, categories) {
	let newProducts = [];
	
	categories.forEach(category => {
		newProducts.push({
			category: category,
			products: products.filter(product => product.categoryId === category.id)
		});
		products = products.filter(product => product.categoryId !== category.id);
	});
	
	return newProducts;
}

router.get('/', function(req, res) {
	Products.getProducts().then(calculateTotal).then(products => {
		products = groupProducts(products, res.locals.categories);
		
		res.render('index', {
			products
		});
	});
});

router.get('/contact', function(req, res) {
	res.render('contact');
});

router.get('/menu', function(req, res) {
	Products.getProducts().then(calculateTotal).then(products => {
		products = groupProducts(products, res.locals.categories);
		console.log(products);
		res.render('menu-classic', {
			products
		});
	});
});

router.get('/menu/:id', function(req, res) {
	const id = parseInt(req.params.id, 10);
	
	if(!functions.checkId(id)) {
		res.status(403).send("Invalid id");
		return;
	}
	
	Products.getProducts({
		categoryId: id
	}).then(calculateTotal).then(products => {
		const category = res.locals.categories.find(category => category.id === id);
		
		res.render('menu-single', {
			category,
			products
		});
	});
});

router.get('/item/:id', function(req, res) {
	const id = req.params.id;
	
	if(!functions.checkId(id)) {
		res.status(404).send("Invalid id");
		return;
	}
	
	Products.getProduct(id).then(product => {
		calculateTotal([product]);
		
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
