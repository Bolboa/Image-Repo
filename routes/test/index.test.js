require('dotenv').config();
const supertest = require('supertest');
const http = require('http');
const app = require('../../app');
const AWS = require('aws-sdk');
AWS.config.update({ accessKeyId: process.env.ID, secretAccessKey: process.env.SECRET });

const request = supertest(http.createServer(app.callback()));

const s3 = new AWS.S3();
const testParamsForImageBucket = {
	Bucket: process.env.IMAGE_BUCKET_NAME,
	Prefix: 'test/'
};

const cases = [
	[`${__dirname}/resources/test.png`, 'image/png', 200, 1],
	[`${__dirname}/resources/test.jpg`, 'image/jpg', 200, 1],
	[`${__dirname}/resources/test.pdf`, 'application/pdf', 400, 0]
];

beforeAll(() => {
	return new Promise(resolve => {
		emptyS3Directory();
		resolve();
	});
});

describe('Image Upload', () => {
	test.each(cases)(
		'Image path %p and content type %p as arguments, returns %p',
		async (image, contentType, status, expectedCount) => {
			const data = await request
				.post('/api/documents/upload?user=test')
				.attach('test', image, { contentType: contentType });
			await expect(data.status).toBe(status);

			const bucketData = await testSuccesfulUpload();
			console.log(bucketData);
			
		}
	);
});

const testSuccesfulUpload = async () => {
	return await s3
		.listObjectsV2(testParamsForImageBucket)
		.promise()
		.then(data => { return data; })
		.catch(() => { return; });
};

const emptyS3Directory = async () => {
	const listedObjects = await s3.listObjectsV2(testParamsForImageBucket).promise();
	if (listedObjects.Contents.length === 0) return;

	const deleteParams = {
		Bucket: process.env.IMAGE_BUCKET_NAME,
		Delete: { Objects: [] }
	};

	listedObjects.Contents.forEach(({ Key }) => {
		deleteParams.Delete.Objects.push({ Key });
	});

	await s3.deleteObjects(deleteParams).promise();
	if (listedObjects.IsTruncated) emptyS3Directory();
};