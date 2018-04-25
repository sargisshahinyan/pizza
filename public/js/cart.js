setTimeout(function f() {
	if(typeof window.jQuery === 'undefined') {
		setTimeout(f, 500);
		return;
	}
	
	let cart;
	
	try {
		cart = JSON.parse(localStorage.getItem("cart")) || [];
	} catch(e) {
		cart = [];
	}
	
	let $ordersContainer = $("#orders-list");
	let $orderItems = $ordersContainer.children('div');
	
	let $name = $("#name");
	let $surname = $("#surname");
	let $email = $("#email");
	let $phone = $("#phone");
	let $address1 = $("#address-1");
	let $address2 = $("#address-2");
	let $city = $("#city");
	let $state = $("#state");
	
	let hideOrder = (function() {
		let $orderDetails = $('#order-details'),
			$alert = $('#alert');
		
		return function () {
			cookies.eraseCookie('count');
			localStorage.clear();
			$orderDetails.modal('hide');
			$alert.on('hidden.bs.modal', function () {
				location.pathname = '/';
			}).modal('show');
		}
	})();
	
	calculate();
	
	function calculate() {
		let checkout = 0;
		let promises = [];
		
		cart.forEach((item, i) => {
			promises[i] = $.ajax({
				url: '/api/products/' + item.id,
				method: 'GET'
			}).then(product => {
				let prod = new Product(product);
				const sum = prod.calculate(item);
				
				checkout += sum;
				
				$orderItems.eq(i)
					.attr('id', `product-${item.id}`)
					.find('input')
						.val(item.quantity)
						.end()
					.find('.photo')
						.attr('src', product.image || '')
						.end()
					.find('.category')
						.text(product.categoryName || '')
						.end()
					.find('.name')
						.text(product.name)
						.attr('href', '/item/' + product.id)
						.end()
					.find('.total')
						.text('$' + sum.toFixed(2));
			});
		});
		
		$.when(...promises).then(() => {
			$("#total").text(checkout.toFixed(2));
		});
	}
	
	$ordersContainer.on('click', function (e) {
		let $element = $(e.target);
		
		switch (true) {
			case $element.hasClass('delete'):
				deleteItem($element);
				break;
		}
	}).on('change', 'input', function() {
		const id = +$(this).closest('.item').attr('id').match(/\d+/)[0];
		
		cart.some(item => {
			if(item.id === id) {
				item.quantity = parseInt(this.value, 10) || 1;
				return true;
			}
		});
		
		calculate();
	});
	
	$("#make-order").click(function () {
		let data = collectData();
		
		if(!checkData(data)) {
			return;
		}
		
		data.products = JSON.stringify(data.products);
		data.from = 'user';
		
		sendRequest(data);
	});
	
	function sendRequest(data) {
		$.ajax({
			url: '/api/orders/',
			method: 'POST',
			data: data,
			dataType: 'json'
		}).then(function () {
			hideOrder();
		}, function (error) {
			console.log(error);
		});
	}
	
	function deleteItem($element) {
		let $parent = $element.closest('.row');
		const id = parseInt($parent[0].id.match(/product-(.+)/)[1]);
		
		cart = cart.filter(order => order.id !== id);
		localStorage.setItem('cart', JSON.stringify(cart));
		cookies.createCookie('count', cart.length, 5);
		$(".cart-length").text(cart.length);
		if(!cart.length) {
			location.pathname = '/';
		} else {
			calculate();
		}
		$parent.remove();
	}
	
	function collectData() {
		let data =  {
			firstName: $name.val(),
			lastName: $surname.val(),
			email: $email.val(),
			phone: $phone.val(),
			address1: $address1.val(),
			address2: $address2.val(),
			city: $city.val(),
			state: $state.val(),
			products: cart
		};
		
		data.products = data.products.map(product => ({
			id: product.id,
			quantity: product.quantity,
			instructions: product.instructions,
			adds: product.subdata.reduce(function fetch(data, item) {
				if(item.children) {
					return data.concat(item.children.reduce(fetch, []));
				}
				
				return data.concat(item.id);
			}, [])
		}));
	
		return data;
	}
	
	function checkData(obj) {
		for(let prop in obj) {
			if(!obj.hasOwnProperty(prop)) {
				continue;
			}
			
			if(!obj[prop] && obj[prop] !== 0 && prop !== 'instructions' && prop !== 'address2') {
				return false;
			}
			
			if(typeof obj[prop] === 'object') {
				let result = checkData(obj[prop]);
				
				if(!result) {
					return false;
				}
			}
		}
		
		return true;
	}
	
	paypal.Button.render({
		env: 'sandbox', // Or 'sandbox' | 'production'
		
		commit: true, // Show a 'Pay Now' button
		
		style: {
			color: 'blue',
			shape: 'pill',
			size: 'medium'
		},
		
		payment: function() {
			
			// Set up a url on your server to create the payment
			const CREATE_URL = '/paypal/payment';
			
			// Make a call to your server to set up the payment
			return paypal.request.post(CREATE_URL, {
				cart: JSON.stringify(cart),
				products: JSON.stringify(collectData().products)
			}).then(function(res) {
				return res.paymentID;
			});
		},
		
		// onAuthorize() is called when the buyer approves the payment
		onAuthorize: function(data, actions) {
			
			// Set up a url on your server to execute the payment
			const EXECUTE_URL = '/paypal/execute/';
			
			// Make a call to your server to execute the payment
			return paypal.request.post(EXECUTE_URL, {
					paymentID: data.paymentID,
					payerID: data.payerID
				})
				.then(function () {
					hideOrder();
				});
		}
	}, '#paypal-button');
}, 500);