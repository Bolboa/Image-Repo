require('dotenv').config();
const koa = require('koa');
const router = require('./routes').default;
const koaBody = require('koa-body');

const app = new koa();
app.use(koaBody({ multipart: true }));
app.use(router());

app.listen(process.env.PORT);