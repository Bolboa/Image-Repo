require('dotenv').config();
const AWS = require('aws-sdk');
AWS.config.update({ accessKeyId: process.env.ID, secretAccessKey: process.env.SECRET });

const s3 = new AWS.S3();

const NUMBER_OF_IMAGE_TYPES = 4;
const NUMBER_OF_ZIP_TYPES = 1;

const testParamsForImageBucket = {
	Bucket: process.env.IMAGE_BUCKET_NAME,
	Prefix: 'test/'
};

const testParamsForZipBucket = {
	Bucket: process.env.ZIP_BUCKET_NAME,
	Prefix: 'test/'
};

const cases = [
	['png'],
	['jpg'],
	['jpeg'],
	['gif']
];

const destinationTest = () => describe('Destination Content', () => {
	test.each(cases)('Check Image Type %p', 
	async (type) => {
		const imageData = await testContent(testParamsForImageBucket);
		const result = await containsType(imageData.Contents, type);
		expect(result).toBe(true);
	});

	test('Check If Images Were Uploaded', async () => {
		const imageData = await testContent(testParamsForImageBucket);
		await expect(imageData.KeyCount).toBe(NUMBER_OF_IMAGE_TYPES);
	});

	test('Check Zip Types', async () => {
		const zipData = await testContent(testParamsForZipBucket);
		const result = await containsType(zipData.Contents, 'zip');
		expect(result).toBe(true);
	});

	test('Check If Zip Was Uploaded', async () => {
		const zipData = await testContent(testParamsForZipBucket);
		await expect(zipData.KeyCount).toBe(NUMBER_OF_ZIP_TYPES);
	});
});

const testContent = async (params) => {
  return await s3
    .listObjectsV2(params)
    .promise()
    .then(data => { return data; })
    .catch(() => { return; });
};

const containsType = async (data, type) => {
	return data.find(x => x.Key.includes(type)) === undefined 
		? false 
		: true;
};

module.exports = destinationTest;