setTimeout(function f() {
	if(typeof window.jQuery === "undefined") {
		setTimeout(f, 500);
		return;
	}
	
	const url = '/api';
	let prod = null;
	const $productDetails = $("#product-details");
	const $alert = $("#alert");
	const $totalPrice = $('#total-price');
	
	$.ajax({
		url: url + '/products/' + location.pathname.split('/').filter(Boolean).pop(),
		method: "GET"
	}).then(product => {
		prod = new Product(product);
		Product.renderAdds(product.additions);
		
		const item = (JSON.parse(localStorage.getItem('cart')) || []).find(item => item.id === product.id);
		
		if (item) {
			fillProduct(item);
			$productDetails.modal('show');
		}
		
		$totalPrice.text(prod.calculate(collectData()));
		
		$('.order-details').change(() => $totalPrice.text(prod.calculate(collectData()).toFixed(2)));
	});
	
	$("#basket-button").click(function() {
		let data = collectData();
		let cart;
		
		try {
			cart = JSON.parse(localStorage.getItem("cart")) || [];
		} catch(e) {
			cart = [];
		}
		
		cart.some((item, i) => {
			if(item.id === data.id) {
				cart.splice(i, 1);
				return true;
			}
		});
		
		cart.push(data);
		
		localStorage.setItem('cart', JSON.stringify(cart));
		cookies.createCookie('count', cart.length, 5);
		$("#basket-size").text(cart.length);
		$productDetails.modal('hide');
		$alert.modal('show').on('hide.bs.modal\t', () => location.href = '/#products');
	});
	
	
	
	function fillProduct(product) {
		$("#quantity").val(product.quantity);
		$('#instructions>textarea').val(product.instructions);
		
		product.subdata.forEach(function fill(data) {
			const $elem = $(`[data-id='${data.id}']`);
			
			if($elem.is('option')) {
				$elem.attr('selected', 'selected');
				$elem.parent().prop('disabled', false);
			} else {
				setTimeout(() => {
					$elem.closest('.type-2').collapse('show');
				}, 500);
				
				$elem.prop('checked', true);
			}
			
			if(Array.isArray(data.children)) {
				data.children.forEach(fill);
			}
		});
	}
	
	function collectData() {
		let fullData = {
			id: prod.product.id,
			quantity: $("#quantity").val(),
			instructions: $('#instructions>textarea').val()
		};
		
		fullData.subdata = prod.product.additions.map(add => {
			let list = [];
			
			for(let type in add.children) {
				if(add.children.hasOwnProperty(type)) {
					list = list.concat(add.children[type]);
				}
			}
			
			return {
				id: add.id,
				children: list.map(function collect(add) {
					const $element = $(`[data-id='${add.id}']`);
					
					if(!$element.is('input:checked') && !$element.is('option:selected')) {
						return null;
					}
					
					let result = {
						id: add.id
					};
					
					if(typeof add.children === "object") {
						let list = [];
						
						for(let type in add.children) {
							if(add.children.hasOwnProperty(type)) {
								list = list.concat(add.children[type]);
							}
						}
						
						result.children = list.map(collect);
					}
					
					return result;
				})
			};
		});
		fullData.subdata = fullData.subdata.filter(function filter(data) {
			if(!data) {
				return false;
			}
			
			if(Array.isArray(data.children)) {
				data.children = data.children.filter(filter);
			}
			
			return true;
		});
		
		return fullData;
	}
}, 500);