require('dotenv').config();
const FileType = require('file-type');
const AWS = require('aws-sdk');
AWS.config.update({ accessKeyId: process.env.ID, secretAccessKey: process.env.SECRET });

const IMAGE_REPO = process.env.IMAGE_BUCKET_NAME;

const PART_SIZE = 1024 * 1024 * 5;
const MAX_UPLOAD_RETRIES = 3;

const multipartMap = { Parts: [] };

const uploadSingleFile = async (buffer, name, username) => {
	const s3 = new AWS.S3();
	const contentType = await FileType.fromBuffer(buffer).mime;
  const fileName = username + '/' + name;
  let sizeLeft = Math.ceil(buffer.length / PART_SIZE);
	await s3
		.createMultipartUpload({
    	Bucket: IMAGE_REPO,
    	Key: fileName,
    	ContentType: contentType
		})
		.promise()
		.then(multipart => {
			let partNum = 0;
			for (let rangeStart = 0; rangeStart < buffer.length; rangeStart += PART_SIZE) {
				partNum++;
				uploadSlice({
					Body: buffer.slice(rangeStart, Math.min(rangeStart + PART_SIZE, buffer.length)),
					Bucket: multipart.Bucket,
					Key: fileName,
					PartNumber: String(partNum),
					UploadId: multipart.UploadId
				}, s3, --sizeLeft);
			}
		})
		.catch(err => { throw err });
};

const uploadSlice = async (partParams, s3, sizeLeft, retries=1) => {
	const partNum = partParams.PartNumber;
	await s3
		.uploadPart(partParams)
		.promise()
		.then(data => {
			multipartMap.Parts[partNum - 1] = {
				ETag: data.ETag,
				PartNumber: Number(partNum)
			}
			sizeLeft <= 0 && completeUpload({
				Bucket: partParams.Bucket,
				Key: partParams.Key,
				MultipartUpload: multipartMap,
				UploadId: partParams.UploadId
			}, s3);
		})
		.catch(() => {
			if (retries < MAX_UPLOAD_RETRIES) uploadSlice(s3, partParams, retries+1);
      else throw new Error(`Failed uploading part: #${partNum}`)
		});
};

const completeUpload = async (completeParams, s3) => {
	await s3
		.completeMultipartUpload(completeParams)
		.promise()
		.catch(err => { throw err });
};

module.exports = uploadSingleFile;