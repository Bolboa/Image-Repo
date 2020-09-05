require('dotenv').config();
const AWS = require('aws-sdk');
AWS.config.update({ accessKeyId: process.env.ID, secretAccessKey: process.env.SECRET });

const s3 = new AWS.S3();

const NUMBER_OF_IMAGE_TYPES = 4;

const testParamsForImageBucket = {
	Bucket: process.env.IMAGE_BUCKET_NAME,
	Prefix: 'test/'
};

const testParamsForUsers = {
	Bucket: process.env.IMAGE_BUCKET_NAME
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
		const imageDataContent = imageData.Contents.filter(data => { return !data.Key.includes('zip') });
		const result = await containsType(imageDataContent, type);
		expect(result).toBe(true);
	});

	test.each(cases)('Check Image Type From Zip %p', 
	async (type) => {
		const imageData = await testContent(testParamsForImageBucket);
		const imageDataContent = imageData.Contents.filter(data => { return data.Key.includes('zip') });
		const result = await containsType(imageDataContent, type);
		expect(result).toBe(true);
	});

	test('Check If Images Were Uploaded', async () => {
		const imageData = await testContent(testParamsForImageBucket);
		const imageDataContent = imageData.Contents.filter(data => { return !data.Key.includes('zip') });
		await expect(imageDataContent.length).toBe(NUMBER_OF_IMAGE_TYPES);
	});

	test('Check If Image Uploaded Using Zip', async () => {
		const imageData = await testContent(testParamsForImageBucket);
		const imageDataContent = imageData.Contents.filter(data => { return data.Key.includes('zip') });
		await expect(imageDataContent.length).toBe(NUMBER_OF_IMAGE_TYPES);
	});

	test('Check If Correct Users Were Uploaded', async () => {
		const imageData = await testContent(testParamsForUsers);
		const resultBob = await containsType(imageData.Contents, 'bob');
		expect(resultBob).toBe(true);
		const resultSara = await containsType(imageData.Contents, 'sara');
		expect(resultSara).toBe(true);
		const resultJohn = await containsType(imageData.Contents, 'john');
		expect(resultJohn).toBe(false);
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