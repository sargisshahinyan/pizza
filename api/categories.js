const express = require('express');
const router = express.Router();

const functions = require('../libs/functions');

const Categories = require('../models/categories');

router.get('/', function(req, res) {
	Categories.getCategories().then(categories => {
		res.json(categories);
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
	
	Categories.getCategory(id).then(category => {
		res.json(category);
	});
});

router.post('/', function(req, res) {
	let data = req.body;
	
	const param = functions.getMissingParam({
		keys: ['category'],
		data: data
	});
	
	if(param) {
		res.status(403).json({
			"message": `${param.replace(/^./, l => l.toUpperCase())} parameter is missing`
		});
		return;
	}
	
	Categories.addCategory(data).then(category => {
		res.status(201).json(category);
	}, error => {
		console.log(error);
		res.status(500).end();
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
	
	const param = functions.getMissingParam({
		keys: ['category'],
		data: data
	});
	
	if(param) {
		res.status(403).json({
			"message": `${param.replace(/^./, l => l.toUpperCase())} parameter is missing`
		});
		return;
	}
	
	Categories.editCategory(id, data).then(() => {
		res.json({
			"message": "Category changed"
		});
	}, error => {
		console.log(error);
		res.status(500).json({
			"message": "Category is not changed"
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
	
	Categories.deleteCategory(id).then(() => {
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

module.exports = router;