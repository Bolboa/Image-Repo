const supertest = require('supertest');
const http = require('http');
const app = require('../../app');

const request = supertest(http.createServer(app.callback()));

const cases = [
	[`${__dirname}/resources/test.png`, 'image/png', 200],
	[`${__dirname}/resources/test.jpg`, 'image/jpg', 200],
	[`${__dirname}/resources/test.pdf`, 'application/pdf', 400]
];

describe('Image Upload', () => {
	test.each(cases)(
		'Image path %p and content type %p as arguments, returns %p',
		async (image, contentType, status) => {
			const data = await request
				.post('/api/documents/upload')
				.attach('test', image, { contentType: contentType });
			expect(data.status).toBe(status);
		}
	);
});