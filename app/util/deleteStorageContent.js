require('dotenv').config();
const AWS = require('aws-sdk');
AWS.config.update({ accessKeyId: process.env.ID, secretAccessKey: process.env.SECRET });

const s3 = new AWS.S3();

const PREFIX = process.argv[0];

const testParamsForImageBucket = {
	Bucket: process.env.IMAGE_BUCKET_NAME,
	Prefix: PREFIX
};

const emptyS3Directory = async (params) => {
	const listedObjects = await s3.listObjectsV2(params).promise();
	if (listedObjects.Contents.length === 0) return;

	const deleteParams = {
		Bucket: params.Bucket,
		Delete: { Objects: [] }
	};

	deleteParams.Delete.Objects = await Promise.all(listedObjects.Contents.map(async (content) => { 
		return { Key: content.Key }
	}));

	await s3.deleteObjects(deleteParams).promise();
	if (listedObjects.IsTruncated) await emptyS3Directory(params);
};

emptyS3Directory(testParamsForImageBucket);