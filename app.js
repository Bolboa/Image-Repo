require('dotenv').config();
const koa = require('koa');
const koaBody = require('koa-body');
const Router = require('koa-router');

const app = new koa();
app.use(koaBody({ multipart: true }));

const router = new Router({ prefix: '/api' });

const upload = require("./upload");

router.post('/documents/upload', upload.uploadFiles);
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(process.env.PORT);