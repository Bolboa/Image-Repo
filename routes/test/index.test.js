const supertest = require('supertest');
const http = require('http');
const app = require('../../app');

const request = supertest(http.createServer(app.callback()));

test('Hello world works', async () => {
	const payload = {
		test: 'fhjfgh'
	};
	try {
		const response = await request.post('/api/documents/upload');
		console.log(response);
	} catch (err) {
		console.log(err);
	}
});