const supertest = require('supertest');
const http = require('http');
const app = require('../../app');

const request = supertest(http.createServer(app.callback()));

const statusTest = require('./status');
const typeTest = require('./destination');

describe('Sequentially Run Tests', () => {
	statusTest(request);
	typeTest();
});