const fs = require('fs');
const multipart = require('./multipart');
const unpack = require('./unpack');

const FILE_REGEX = /\/(jpg|jpeg|png|gif)$/i;

const upload = async ctx => {
	const files = ctx.request.files;
	const username = ctx.request.query.user;
  await Promise.all(Object.keys(files).map(async key => {
		const file = files[key];
		if (file.type.match(FILE_REGEX)) await multipart(fs.readFileSync(file.path), file.name, username);
		else if (file.type === 'application/zip') unpack(file, username);
		else throw new Error(`Cannot Upload the Following Content Type -> ${file.type}`);
	}));
	ctx.status = 200;
};

module.exports = upload;