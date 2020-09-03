require('dotenv').config();
const AWS = require('aws-sdk');
AWS.config.update({ accessKeyId: process.env.ID, secretAccessKey: process.env.SECRET });

const s3 = new AWS.S3();

const NUMBER_OF_TYPES = 4;

const testParamsForImageBucket = {
	Bucket: process.env.IMAGE_BUCKET_NAME,
	Prefix: 'test/'
};

const testParamsForZipBucket = {
	Bucket: process.env.ZIP_BUCKET_NAME,
	Prefix: 'test/'
};

const destinationTest = () => describe('Destination Content', () => {
	test('Check Type', async () => {
		const data = await testContent(testParamsForImageBucket);
		expect(data.KeyCount).toBe(NUMBER_OF_TYPES);
	});
});

const testContent = async (params) => {
  return await s3
    .listObjectsV2(params)
    .promise()
    .then(data => { return data; })
    .catch(() => { return; });
};

module.exports = destinationTest;