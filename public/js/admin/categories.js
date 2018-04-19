$(document).ready(() => {
	const url = '/api';
	const $categoriesList = $("#categories-list");
	const $name = $("#name");
	
	$("#add").click(() => {
		const name = $name.val();
		
		$.ajax({
			url: `${url}/categories`,
			method: "POST",
			data: {
				category: name
			}
		}).then(category => {
			$categoriesList.append(`
				<span data-id="${category._id}" class="list-group-item row">
                    <span class="col-xs-8 list-item-title">
                        ${category.category}
                    </span>
                    <span class="col-xs-4 text-right main-menu">
                        <button class="edit btn btn-success"><span class="edit glyphicon glyphicon-pencil"></span></button>
                        <button class="delete btn btn-danger"><span class="delete glyphicon glyphicon-remove"></span></button>
                    </span>
                    <span class="col-xs-4 text-right edit-menu" style="display: none">
                        <button class="save btn btn-primary"><span class="save glyphicon glyphicon-ok"></span></button>
                        <button class="cancel btn btn-default"><span class="cancel glyphicon glyphicon-ban-circle"></span></button>
                    </span>
                </span>
			`);
		}, error => {
			console.log(error);
		}).always(() => {
			$name.val("");
		});
	});
	
	let val = '';
	$categoriesList.click((event) => {
		const $element = $(event.target);
		const $parent = $element.parents(".list-group-item");
		const $title = $parent.find('.list-item-title');
		const allowed = ['edit', 'delete', 'cancel', 'save'];
		
		if(!allowed.some(cls => $element.hasClass(cls))) {
			return;
		}
		
		const id = $parent.data('id');
		
		switch (true) {
			case $element.hasClass('edit'):
				$parent.find('.main-menu').hide();
				$parent.find('.edit-menu').show();
				val = $title.attr('contenteditable', 'true').focus().text();
				break;
			case $element.hasClass('delete'):
				$.ajax({
					method: "DELETE",
					url: `${url}/categories/${id}`
				}).then(() => {
					$element.parents(".list-group-item").remove();
				}, error => console.log(error));
				break;
			case $element.hasClass('cancel'):
				cancel();
				break;
			case $element.hasClass('save'):
				val = $title.text();
				$.ajax({
					url: `${url}/categories/${id}`,
					method: "PUT",
					data: {
						category: val
					}
				}).then(() => {
					cancel();
				}, error => console.log(error));
				break;
		}
		
		function cancel() {
			$parent.find('.main-menu').show();
			$parent.find('.edit-menu').hide();
			$title.attr('contenteditable', 'false').text(val);
		}
	});
});