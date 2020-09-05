const FileType = require('file-type');
const StreamZip = require('node-stream-zip');
const multipart = require('./multipart');

const FILE_REGEX = /\/(jpg|jpeg|png|gif)$/i;

const unpack = async (file, username) => {
	const zip = new StreamZip({
    file: file.path,
    storeEntries: true
	});

	zip.on('entry', async entry => {
		zip.stream(entry.name, async (err, stream) => {
			if (err) return;
			stream.on('data', async chunk => {
				const fileType = await FileType.fromBuffer(chunk);
				fileType !== undefined
					&& fileType.mime.match(FILE_REGEX)
					&& await multipart(chunk, entry.name, username);
			});
		});
	});
};

module.exports = unpack;
