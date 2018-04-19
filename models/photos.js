const fs = require("fs");
const isImage = require("is-image");

class Photos{
	static createPhoto(name = '', path = '', avatar) {
		return new Promise((resolve, reject) => {
			let extension;
			
			try {
				extension = avatar.match(/\/(.+?);/)[1];
			} catch (e) {
				reject({
					message: "Invalid image"
				});
				return;
			}
			
			name += `.${extension}`;
			avatar = avatar.replace(/http:\/\/|https:\/\//, "");
			
			fs.writeFile(path + name, avatar.replace(new RegExp(`^data:image\\/${extension};base64,`), ""), 'base64', (err) => {
				if(err) {
					throw err;
				}
				
				if(!isImage(name)) {
					fs.unlinkSync(path + name);
					reject({
						message: "Is not valid image"
					});
					return;
				}
				
				resolve(name);
			});
		});
	}
	
	static deletePhoto(path = '', name = '') {
		if(fs.existsSync(path + name)) {
			fs.unlinkSync(path + name);
		}
	}
}

module.exports = Photos;