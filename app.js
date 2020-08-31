require('dotenv').config();
const koa = require('koa');
const router = require('./routes').default;
const koaBody = require('koa-body');

const app = new koa();
app.use(koaBody({ multipart: true }));

app.use(async (ctx, next) => {
	try {
		await next()
	} catch (err) {
		ctx.status = 400
		ctx.body = `Uh-oh: ${err.message}`
		console.log('Error handler:', err.message)
	}
});

app.use(router());

app.listen(process.env.PORT);