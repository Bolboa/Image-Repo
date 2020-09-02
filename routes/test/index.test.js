const request = require('supertest');
const route = require('../src/index');

test('Hello world works', async () => {
	const payload = {
		test: ''
	};
	console.log(route)
	try {
		const response = await request(route).post('/api/documents/upload').send(payload);
		console.log("herre");
		console.log(response);
	} catch (err) {
		console.log(err);
		console.log("noot");
	}
});