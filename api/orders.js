const express = require('express');
const router = express.Router();

const functions = require('../libs/functions');
const emailValidator = require('email-validator');

const Orders = require('../models/orders');

const ProductHelper = require('../public/js/product');

router.get('/', function(req, res) {
	Orders.getOrders().then(orders => {
		res.json(orders);
	});
});

router.get('/:id', function(req, res) {
	const id = req.params.id;
	
	if(!functions.checkId(id)) {
		res.status(403).json({
			"message": "Invalid id"
		});
		return;
	}
	
	Orders.getOrder(id).then(order => {
		Array.isArray(order.products) && order.products.forEach(product => {
			let prod = new ProductHelper(product);
			
		});
		res.json(order);
	});
});

router.post('/', function(req, res) {
	let data = req.body;
	
	if(data.products)
		data.products = JSON.parse(data.products);
	
	const param = functions.getMissingParam({
		keys: ['firstName', 'lastName', 'email', 'phone', 'address1', 'city', 'state', 'products'],
		data: data
	});
	
	if(param) {
		res.status(403).json({
			"message": `${param.replace(/^./, l => l.toUpperCase())} parameter is missing`
		});
		return;
	}
	
	if(!emailValidator.validate(data.email)) {
		res.status(403).json({
			"message": 'Invalid email'
		});
		return;
	}
	
	Orders.addOrder(data).then(order => {
		res.status(201).json(order);
	}, error => {
		console.log(error);
		res.status(500).end();
	});
});

module.exports = router;