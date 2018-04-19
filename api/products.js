const express = require("express");
const router = express.Router();

const functions = require("../libs/functions");

const Products = require("../models/products");
const Photos = require("../models/photos");

const path = `${__dirname}/../public`;

router.get("/", function (req, res) {
	Products.getProducts().then(products => {
		res.json(products);
	}, error => console.log(error));
});

router.get("/:id", function (req, res) {
	let id = req.params.id;
	
	if(!functions.checkId(id)) {
		res.status(403).json({
			"message": "Invalid id"
		});
		return;
	}
	
	Products.getProduct(id).then(products => {
		res.json(products);
	}, error => console.log(error));
});

router.post('/', function(req, res) {
	let data = req.body;
	
	const param = functions.getMissingParam({
		keys: ['title', 'price', 'category', 'photo', 'description'],
		data: data
	});
	
	if(data.additions)
		data.additions = JSON.parse(data.additions);
	
	if(param) {
		res.status(403).json({
			"message": `${param.replace(/^./, l => l.toUpperCase())} parameter is missing`
		});
		return;
	}
	
	if(!functions.checkId(data.category)) {
		res.status(403).json({
			"message": `Invalid category`
		});
		return;
	}
	
	if(Array.isArray(data.additions)) {
		for(let i = 0; i < data.additions.length; ++i) {
			
			const param = functions.getMissingParam({
				keys: ['id', 'title'],
				data: data.additions[i]
			});
			
			if(param) {
				res.status(403).json({
					"message": `${param.replace(/^./, l => l.toUpperCase())} parameter is missing`
				});
				return;
			}
			
			if(Array.isArray(data.additions[i].list)) {
				for(let j = 0; j < data.additions[i].list.length; ++j) {
					
					const param = functions.getMissingParam({
						keys: data.additions[i].list[j].list ? ['id', 'title'] : ['id', 'title', 'price'],
						data: data.additions[i].list[j]
					});
					
					if(param) {
						res.status(403).json({
							"message": `${param.replace(/^./, l => l.toUpperCase())} parameter is missing`
						});
						return;
					}
					
					if(Array.isArray(data.additions[i].list[j].list)) {
						for(let k = 0; k < data.additions[i].list[j].list.length; ++k) {
							
							const param = functions.getMissingParam({
								keys: ['id', 'title', 'price'],
								data: data.additions[i].list[j].list[k]
							});
							
							if(param) {
								res.status(403).json({
									"message": `${param.replace(/^./, l => l.toUpperCase())} parameter is missing`
								});
								return;
							}
						}
					}
				}
			}
			
			if(Array.isArray(data.additions[i].sublist)) {
				for(let j = 0; j < data.additions[i].sublist.length; ++j) {
					
					const param = functions.getMissingParam({
						keys: ['id', 'title'],
						data: data.additions[i].sublist[j]
					});
					
					if(param) {
						res.status(403).json({
							"message": `${param.replace(/^./, l => l.toUpperCase())} parameter is missing`
						});
						return;
					}
				}
			}
		}
	}
	
	const fileName = `/images/products/${Date.now().toString()}`;
	
	Photos.createPhoto(fileName, path, data.photo).then((avatar) => {
		data.photo = `//${req.headers.host + avatar}`;
		
		Products.addProduct(data).then(product => {
			res.status(201).json(product);
		}, error => {
			console.log(error);
			res.status(500).json(error);
		});
	}, error => {
		res.status(403).json(error);
	});
});

router.put('/:id', function(req, res) {
	let id = req.params.id;
	let data = req.body;
	
	if(!functions.checkId(id)) {
		res.status(403).json({
			"message": "Invalid id"
		});
		return;
	}
	
	if(data.additions)
		data.additions = JSON.parse(data.additions);
	
	if(!checkData(data, res)) {
		return;
	}
	
	const fileName = `/images/products/${Date.now().toString()}`;
	
	Products.getProduct(id).then(product => {
		let pathArray = fileName.split('/');
		pathArray.pop();
		Photos.deletePhoto(path, pathArray.join('/') + '/' + product.photo.split('/').pop());
		
		Photos.createPhoto(fileName, path, data.photo).then((avatar) => {
			data.photo = `${req.protocol}://${req.headers.host + avatar}`;
			
			Products.editProduct(id, data).then((product) => {
				res.json(product);
			}, error => {
				console.log(error);
				res.status(500).json({
					"message": "Product is not changed"
				});
			});
		}, error => {
			res.status(403).json(error);
		});
	});
	
});

router.delete('/:id', function(req, res) {
	let id = req.params.id;
	
	if(!functions.checkId(id)) {
		res.status(403).json({
			"message": "Invalid id"
		});
		return;
	}
	
	Products.deleteProduct(id).then(() => {
		res.json({
			"message": "Category deleted"
		});
	}, error => {
		console.log(error);
		res.status(500).json({
			"message": "Category is not deleted"
		});
	});
});

function checkData(data, res) {
	const param = functions.getMissingParam({
		keys: ['title', 'price', 'category'],
		data: data
	});
	
	if(param) {
		res.status(403).json({
			"message": `${param.replace(/^./, l => l.toUpperCase())} parameter is missing`
		});
		return;
	}
	
	if(!functions.checkId(data.category)) {
		res.status(403).json({
			"message": `Invalid category`
		});
		return;
	}
	
	if(Array.isArray(data.additions)) {
		for(let i = 0; i < data.additions.length; ++i) {
			
			const param = functions.getMissingParam({
				keys: ['id', 'title'],
				data: data.additions[i]
			});
			
			if(param) {
				res.status(403).json({
					"message": `${param.replace(/^./, l => l.toUpperCase())} parameter is missing`
				});
				return false;
			}
			
			if(Array.isArray(data.additions[i].list)) {
				for(let j = 0; j < data.additions[i].list.length; ++j) {
					
					const param = functions.getMissingParam({
						keys: data.additions[i].list[j].list ? ['id', 'title'] : ['id', 'title', 'price'],
						data: data.additions[i].list[j]
					});
					
					if(param) {
						res.status(403).json({
							"message": `${param.replace(/^./, l => l.toUpperCase())} parameter is missing`
						});
						return false;
					}
					
					if(Array.isArray(data.additions[i].list[j].list)) {
						for(let k = 0; k < data.additions[i].list[j].list.length; ++k) {
							
							const param = functions.getMissingParam({
								keys: ['id', 'title', 'price'],
								data: data.additions[i].list[j].list[k]
							});
							
							if(param) {
								res.status(403).json({
									"message": `${param.replace(/^./, l => l.toUpperCase())} parameter is missing`
								});
								return false;
							}
						}
					}
				}
			}
			
			if(Array.isArray(data.additions[i].sublist)) {
				for(let j = 0; j < data.additions[i].sublist.length; ++j) {
					
					const param = functions.getMissingParam({
						keys: ['id', 'title'],
						data: data.additions[i].sublist[j]
					});
					
					if(param) {
						res.status(403).json({
							"message": `${param.replace(/^./, l => l.toUpperCase())} parameter is missing`
						});
						return false;
					}
				}
			}
		}
	}
	
	return true;
}

module.exports = router;