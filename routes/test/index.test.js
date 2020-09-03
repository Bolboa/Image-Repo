require('dotenv').config();
const supertest = require('supertest');
const http = require('http');
const app = require('../../app');
const AWS = require('aws-sdk');
AWS.config.update({ accessKeyId: process.env.ID, secretAccessKey: process.env.SECRET });

const request = supertest(http.createServer(app.callback()));

const cases = [
	[`${__dirname}/resources/test.pdf`, 'application/pdf', 400],
	[`${__dirname}/resources/test.zip`, 'application/zip', 200],
	[`${__dirname}/resources/test.png`, 'image/png', 200],
	[`${__dirname}/resources/test.jpg`, 'image/jpg', 200]
];

describe('Image Upload Status', () => {
	test.each(cases)(
		'Image path %p and content type %p as arguments, returns %p',
		async (image, contentType, status) => {
			const data = await request
				.post('/api/documents/upload?user=test')
				.attach('test', image, { contentType: contentType });
			await expect(data.status).toBe(status);
		}
	);
});