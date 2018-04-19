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
		url: url + '/products/' + location.pathname.split('/').filter(a => a).pop(),
		method: "GET"
	}).then(product => {
		prod = new Product(product);
		renderAdds(product.additions);
		
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
	
	function renderAdds(additions) {
		additions.forEach(add => {
			let element = '';
			const quantity = parseInt(add.quantity, 10);
			const $tab = $(`#tab-${add.id}`);
			
			if(typeof add.children === 'object') {
				element = renderChildren(add.children);
			}
			
			if(quantity && add.children[4]) {
				$tab.append(`<h6>Select up to ${quantity}.</h6>`);
			}
			
			$tab.append(element).data('quantity', quantity || Infinity);
			
			function renderChildren(children, parentId, selected) {
				let result = '';
				
				for(let type in children) {
					if(!children.hasOwnProperty(type)) {
						continue;
					}
					let name = 'a' + Date.now() + Math.floor(Math.random() * 1000);
					
					switch (parseInt(type, 10)) {
						case 1:
						case 4:
							const inputType = parseInt(type, 10) === 1 ? 'radio' : 'checkbox';
							const element = parseInt(type, 10) === 1 ? 'label' : 'span';
							
							result += children[type].map(add => {
								const id = 'a' + Date.now() + Math.floor(Math.random() * 1000);
								let $element = $(`<div class="checkbox type-${type}">
													<${element} data-toggle="collapse" data-target="#${'a' + id}" aria-controls="${'a' + id}">
														<input data-id="${add.id}" type='${inputType}' ${parseInt(add.selected, 10) ? 'checked' : ''} name="${name}">
														<span> ${add.name}</span>
													</${element}>
												</div>`);
								
								if(typeof add.children === 'object') {
									$element.append(renderChildren(add.children, 'a' + id, Boolean(parseInt(add.selected, 10))));
								}
								
								return $element[0].outerHTML;
							}).join('');
							break;
						case 2:
							result += `
								<div class="collapse in type-${type}" id="${parentId}">
								  <div class="well">
								    ${children[type].map(add => {
										const id = 'a' + Date.now() + Math.floor(Math.random() * 1000);
								    	return `<div><input data-id="${add.id}" id="${id}" name="${name}" type='radio' ${parseInt(add.selected, 10) ? 'checked' : ''}><label for="${id}">${add.name}</label></div>\n`
									}).join('')}
								  </div>
								</div>
							`;
							break;
						case 3:
							result += `<select ${!selected ? 'disabled' : ''} class="type-${type}">\n ${children[type].map(add => `<option data-id="${add.id}" ${parseInt(add.selected, 10) ? 'selected' : ''}>${add.name}</option>\n`).join('')} </select>`;
							break;
					}
				}
				
				return $(result);
			}
		});
		
		const $collapseAll = $('.collapse');
		
		if($collapseAll.length) {
			$collapseAll.collapse().on('hide.bs.collapse', function () {
				hide.call($(this).siblings('span')[0])
			});
			
			$('.type-4 .type-2').on('show.bs.collapse', function () {
				return show.call($(this).siblings('span')[0])
			});
		} else {
			$('.type-4').on('click', 'input, span[data-toggle]', function() {
				let $elem;
				
				if($(this).is('input')) {
					$elem = $(this);
				} else {
					$elem = $(this).find('input');
				}
				
				
				if($elem.data('opened'))
					hide.call($elem.closest('span')[0]);
				else
					show.call($elem.closest('span')[0]);
				
				return false;
			});
		}
		
		function show() {
			const $tab = $(this).closest('.tab-pane');
			const quantity = $tab.data('quantity');
			const $inputs = $tab.find('.checkbox>span>input');
			let $thisInput = $(this).find('input');
			
			$thisInput.prop('checked', false);
			
			if ($inputs.filter(':checked').length >= quantity) {
				$thisInput.prop('checked', false);
				return false;
			} else {
				$thisInput.closest('span').siblings('select').prop('disabled', false);
				$thisInput.prop('checked', true).data('opened', true).change();
			}
		}
		
		function hide() {
			$(this).siblings('select').prop('disabled', true);
			$(this).find('input').prop('checked', false).data('opened', false).change();
		}
		
		const $collapse = $('.type-1 .type-2');
		$('.type-1').click(function() {
			$(this).find('select').prop('disabled', false);
			$collapse.collapse('hide');
		});
	}
	
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