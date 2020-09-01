const combineRouters = require('koa-combine-routers');
const Router = require('koa-router');
const uploadService = require('../services/uploader/index').default;

const uploadRouter = new Router({ prefix: '/api' });

uploadRouter.post('/documents/upload', uploadService);

const router = combineRouters(
	uploadRouter
);
  
module.exports.default = router;