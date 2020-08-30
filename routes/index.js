const combineRouters = require('koa-combine-routers');
const uploadRouter = require('./upload').default;

const router = combineRouters(
	uploadRouter
);
  
module.exports.default = router;