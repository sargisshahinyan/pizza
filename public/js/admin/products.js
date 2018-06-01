$(document).ready(function () {
	const url = '/api';
	const $document = $(document);
	const $category = $('#category');
	const $title = $('#title');
	const $price = $('#price');
	const $productDetails = $('#product-details');
	const $photoFile = $('#photo');
	const $photo = $('.photo');
	const $productsList = $('#products-list');
	const $description = $('#description');
	
	const $add = $('#add');
	const $save = $('#save');
	const $cancel = $('#cancel');
	
	let cat = {};
	let productId = null;
	
	$category.change(function() {
		const id = $category.val();

		renderAdds(id);
	});
	
	$productDetails.on('click', (event) => {
		let $element = $(event.target);

		if(!$element.is('input') || $element.attr('type') !== 'checkbox') {
			return;
		}

		$element.siblings('select').attr('disabled', !$element.prop('checked'));
	});
	
	$add.on('click', () => {
		let data = collectData();
		
		if(checkObject(data)) {
			$.ajax({
				url: url + '/products',
				method: 'POST',
				data: data
			}).then(product => {
				$productsList.append(`
					<span id="id-${product._id}" data-id="${product._id}" class="list-group-item row">
	                    <span class="col-xs-8 list-item-title">
	                        ${product.title}
	                    </span>
	                    <span class="col-xs-4 text-right main-menu">
	                        <button class="edit btn btn-success"><span class="edit glyphicon glyphicon-pencil"></span></button>
	                        <button class="delete btn btn-danger"><span class="delete glyphicon glyphicon-remove"></span></button>
	                    </span>
	                </span>
				`);
				
				cancel();
			}, error => {
				alert('error');
				console.log(error);
			});
		} else {
			alert('Please input all data');
		}
	});
	
	$productsList.on('click', (event) => {
		const $element = $(event.target);
		const $parent = $element.parents('.list-group-item');
		const allowed = ['edit', 'delete'];
		
		if(!allowed.some(cls => $element.hasClass(cls))) {
			return;
		}
		
		const id = $parent.data('id');
		
		switch (true) {
			case $element.hasClass('edit'):
				$.ajax({
					url: url + '/products/' + id,
					method: 'GET'
				}).then(function (product) {
					if(productId) {
						cancel();
					}
					
					renderAdds(product.category).then(() => {
						Photos.convertUrlToImage(product.photo).then(photo => {
							productId = product._id;
							$title.val(product.title);
							$price.val(product.price);
							$category.val(product.category);
							$description.val(product.description);
							$photo.attr('src', photo || '/img/upload.PNG');
							
							$parent.find('.main-menu').hide();
							$add.hide();
							$cancel.show();
							$save.show();
							$document.scrollTop(0);
							checkAdds(product.additions);
						});
					});
				});
				
				
				break;
			case $element.hasClass('delete'):
				if(!confirm('Delete this product?')) {
					return;
				}
				
				$.ajax({
					method: 'DELETE',
					url: `${url}/products/${id}`
				}).then(() => {
					$element.parents('.list-group-item').remove();
				}, error => console.log(error));
				break;
		}
	});
	
	$cancel.on('click', () => {
		cancel();
	});
	
	$save.on('click', () => {
		let data = collectData();
		
		if(checkObject(data)) {
			$.ajax({
				url: url + '/products/' + productId,
				method: 'PUT',
				data: data
			}).then(product => {
				$(`#id-${productId}`).find('.list-item-title').text(product.title);
				
				cancel();
			}, error => {
				alert('error');
				console.log(error);
			});
		} else {
			alert('Please input all data');
		}
	});
	
	$photoFile.change(function () {
		Photos.convertFileToImage(this.files[0]).then(img => {
			$photo.attr('src', img);
		});
	});
	
	function checkAdds(adds) {
		if(typeof adds === 'object') {
			for(let pr in adds) {
				if(adds[pr].selected) {
					let el = $(`[data-id='${adds[pr].id}']`);
					if(el.is('option')) {
						el.attr('selected', '');
					} else {
						el.find('input').click().prop('checked', true);
					}
				}
				
				if(typeof adds[pr] === 'object') {
					checkAdds(adds[pr]);
				}
			}
		}
	}
	
	function renderAdds(id) {
		$productDetails.empty();
		
		if(!id) {
			return;
		}
		
		return $.ajax({
			url: '/api/categories/' + id
		}).then(category => {
			if(category) {
				cat = category;
				
				if(Array.isArray(category.additions)) {
					$productDetails.html(`<h2 class="col-sm-12">Choose an adds that included in product</h2>`);
					
					category.additions.forEach((add) => {
						$productDetails.append(`
						<div class="col-md-4" id="tab-${add.id}"></div>
						`);
					});
					
					Product.renderAdds(category.additions);
				}
			}
		}, error => console.log(error));
	}
	
	function collectData() {
		let data = {
			title: $title.val(),
			price: $price.val(),
			photo: $photo.attr('src'),
			description: $description.val()
		};
		
		const $checked = $(':checked:not(:disabled)');
		
		$checked.each(function() {
			let $element = $(this);
			
			if(!$element.is('option')) {
				$element = $element.parent();
			}
			
			checkAdd(cat.additions, $element.data('id'))
		});
		
		data.category = cat._id;
		if(cat.additions)
			data.additions = JSON.stringify(cat.additions);
		
		return data;
	}
	
	function cancel() {
		$('.main-menu').show();
		$add.show();
		$save.hide();
		$cancel.hide();
		
		productId = null;
		
		$title.val('');
		$price.val('');
		$description.val('');
		$photo.attr('src', '/img/upload.PNG');
		$category.val('').change();
	}
	
	function checkAdd(cat, id) {
		if(!cat) {
			return;
		}
		
		for(let pr in cat) {
			if(!cat.hasOwnProperty(pr)) {
				continue;
			}
			
			if(cat[pr].id === id) {
				cat[pr].selected = true;
				return true;
			}
			
			if(typeof cat[pr] === 'object') {
				let res = checkAdd(cat[pr], id);
				
				if(res) {
					return true;
				}
			}
		}
	}
	
	function checkObject (data) {
		if(typeof data !== 'object') {
			throw new Error('Object required');
		}
		
		for(let p in data) {
			if(!data[p] && data[p] !== 0) {
				return false;
			}
			
			if(typeof data[p] === 'object') {
				let res = checkObject(data[p]);
				
				if(!res) {
					return false;
				}
			}
		}
		
		return true;
	}
});