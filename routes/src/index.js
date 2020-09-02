const combineRouters = require('koa-combine-routers');
const Router = require('koa-router');
const uploadService = require('../../services/src/upload/index');

const uploadRouter = new Router({ prefix: '/api' });

uploadRouter.post('/documents/upload', uploadService);

const router = combineRouters(
	uploadRouter
);
  
module.exports = router;