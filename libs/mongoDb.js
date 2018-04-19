const ObjectId = require("mongojs").ObjectID;
const mongoUrl = require("../config/db");
const mongoJs = require('mongojs');
const db = mongoJs(mongoUrl);

global.db = db;

class DB{
  constructor(col) {
	  this._collection = db.collection(col);
  }

  ObjectId(key) {
    return (typeof key === "string") ? new ObjectId(key) : new ObjectId();
  }

  findOne(args) {
    return new Promise((resolve, reject) => {
      this._collection.findOne(...args, function(err, res) {
        err ? reject(err) : resolve(res);
      });
    });
  }

  find(args, options) {
    return new Promise((resolve, reject) => {
    	let result = this._collection.find(...args);
    	
    	if(typeof options === "object") {
		      Object.keys(options).forEach(key => {
		          switch (key) {
		          	case 'limit':
		          		result = result.limit(options[key]);
		          		break;
		          	case 'skip':
		          		result = result.skip(options[key]);
		          		break;
		          	case 'sort':
		          		result = result.sort(options[key]);
		          		break;
		          }
			  });
	    }
    	
    	result.toArray(function(err, res) {
    		err ? reject(err) : resolve(res);
	    });
    });
  }

  insert(args) {
    return new Promise((resolve, reject) => {
      this._collection.insert(...args, function(err, res) {
        err ? reject(err) : resolve(res);
      });
    });
  }

  update(args) {
    return new Promise((resolve, reject) => {
      this._collection.update(...args, function(err, res) {
        err ? reject(err) : resolve(res);
      });
    });
  }
  
  aggregate(args, options) {
  	return new Promise((resolve, reject) => {
	    let result = this._collection.aggregate(args);
	  
	    if(typeof options === "object") {
		    Object.keys(options).forEach(key => {
			    switch (key) {
				    case 'limit':
					    result = result.limit(options[key]);
					    break;
				    case 'skip':
					    result = result.skip(options[key]);
					    break;
				    case 'sort':
					    result = result.sort(options[key]);
					    break;
			    }
		    });
	    }
	  
	    result.toArray(function(err, res) {
		    err ? reject(err) : resolve(res);
	    });
  	});
  }
	
  remove(args) {
  	return new Promise((resolve, reject) => {
	    this._collection.remove(...args, (err, res) => {
		    err ? reject(err) : resolve(res);
	    });
    })
  }
}

module.exports = DB;