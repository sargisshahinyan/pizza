const express = require('express');
const router = express.Router();

// Helpers
const ProductHelper = require('../public/js/product');
const functions = require('../libs/functions');
const request = require('request');

const paypal = require('../config/constants').paypal;
const url = paypal.url;

// Models
const Product = require('../models/products');
const Orders = require('../models/orders');

router.use(function (req, res, next) {
	request.post({
		url: 'https://api.sandbox.paypal.com/v1/oauth2/token',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Authorization': 'Basic ' + Buffer.from(paypal.sandbox).toString('base64')
		},
		form: {
			grant_type: 'client_credentials'
		}
	}, function (error, response, body) {
		if (error) {
			console.error(error);
			res.status(500).end();
			return;
		}
		
		try {
			body = JSON.parse(body);
			res.locals.jsonHeaders = {
				'Content-Type': 'application/json',
				'Authorization': `${body.token_type} ${body.access_token}`
			};
			next();
		} catch (e) {
			res.status(500).end();
		}
	});
});

router.use('/payment', function (req, res) {
	let data = req.body;
	
	const param = functions.getMissingParam({
		keys: ['products', 'cart'],
		data: data
	});
	
	if(param) {
		res.status(403).json({
			"message": `${param.replace(/^./, l => l.toUpperCase())} parameter is missing`
		});
		return;
	}
	
	try {
		data.cart = JSON.parse(data.cart);
		JSON.parse(data.products);
	} catch (e) {
		res.status(400).end();
		return;
	}
	
	let promises = [];
	let sum = 0;
	
	data.cart.forEach((item, i) => {
		promises[i] = Product.getProduct(item.id).then(product => {
			let prod = new ProductHelper(product);
			sum += prod.calculate(item);
		});
	});
	
	Promise.all(promises).then(() => {
		request.post({
			url: url,
			headers: res.locals.jsonHeaders,
			json: {
				"intent": "sale",
				"redirect_urls":
					{
						"return_url": req.protocol + '://' + req.get('host'),
						"cancel_url": req.protocol + '://' + req.get('host')
					},
				"payer":
					{
						"payment_method": "paypal"
					},
				"transactions": [
					{
						"amount":
							{
								"total": sum.toFixed(2),
								"currency": "USD"
							},
						
						"description": data.products,
					}]
			}
		}, function (error, response, body) {
			if (error) {
				console.error(error);
				res.status(500).end();
				return;
			}
			
			res.json({
				paymentID: body.id
			});
		});
	});
});

router.use('/execute', function (req, res) {
	let data = req.body;
	
	const param = functions.getMissingParam({
		keys: ['paymentID', 'payerID'],
		data: data
	});
	
	if(param) {
		res.status(403).json({
			"message": `${param.replace(/^./, l => l.toUpperCase())} parameter is missing`
		});
		return;
	}
	
	request.post({
		url: `${url}/${data.paymentID}/execute/`,
		headers: res.locals.jsonHeaders,
		json: {
			"payer_id": data.payerID
		}
	}, function (error, response, payment) {
		if (error) {
			console.error(error);
			res.status(500).end();
			return;
		}
		
		if(payment.state === 'approved') {
			request.get({
				url: payment.links[0].href,
				headers: res.locals.jsonHeaders
			}, function (error, response, payment) {
				if (error) {
					console.error(error);
					res.status(500).end();
					return;
				}
				
				payment = JSON.parse(payment);
				
				let data =  {
					firstName: payment.payer.payer_info.first_name,
					lastName: payment.payer.payer_info.last_name,
					email: payment.payer.payer_info.email,
					phone: payment.payer.payer_info.phone,
					address1: payment.payer.payer_info.shipping_address.line1,
					address2: payment.payer.payer_info.shipping_address.line2 || '',
					city: payment.payer.payer_info.shipping_address.city,
					state: payment.payer.payer_info.shipping_address.state,
					products: JSON.parse(payment.transactions[0].description),
					payed: 1
				};
				
				Orders.addOrder(data).then(() => {
					res.status(201).end();
				}, error => {
					console.error(error);
					res.status(500).end();
				});
			});
		}
		res.end();
	});
});

module.exports = router;