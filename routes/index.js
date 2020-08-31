const combineRouters = require('koa-combine-routers');
const Router = require('koa-router');
const uploadController = require('../controllers/upload').default;

const uploadRouter = new Router({ prefix: '/api' });

uploadRouter.post('/documents/upload', uploadController);

const router = combineRouters(
	uploadRouter
);
  
module.exports.default = router;