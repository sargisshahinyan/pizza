const express = require('express');
const router = express.Router();

const functions = require('../libs/functions');
const request = require('request');

const constants = require('../config/constants');
const url = constants.paypal.url;

router.use(function (req, res, next) {
	request.post({
		url: 'https://api.sandbox.paypal.com/v1/oauth2/token',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Authorization': 'Basic ' + Buffer.from(constants.paypal.sandbox).toString('base64')
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
	})
});

router.use('/payment', function (req, res) {
	let data = req.body;
	
	const param = functions.getMissingParam({
		keys: ['orders'],
		data: data
	});
	
	if(param) {
		res.status(403).json({
			"message": `${param.replace(/^./, l => l.toUpperCase())} parameter is missing`
		});
		return;
	}
	
	data.orders = JSON.parse(data.orders);

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
							"total": "0.01",
							"currency": "USD"
						}
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
				
				let data = {
					pay_id: payment.id,
					name: payment.payer.payer_info.first_name,
					surname: payment.payer.payer_info.last_name,
					email: payment.payer.payer_info.email,
					phone: payment.payer.payer_info.phone,
					address: [
						payment.payer.payer_info.shipping_address.line1,
						payer.payer_info.shipping_address.line2 || ''
					],
					city: payer.payer_info.shipping_address.city,
					state: payer.payer_info.shipping_address.state,
					postalCode: payer.payer_info.shipping_address.postal_code
				};
			});
		}
		res.end();
	});
});

module.exports = router;