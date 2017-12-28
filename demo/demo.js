const debug = require('debug');
const info = debug('valley-rooter-demo:info');
const error = debug('valley-rooter-demo:error');

const RouterModule = require('../src/index');

const mainRouter = new RouterModule();

mainRouter.add('/index', async function(next) {
  info(this.context);
  await next();
});

const dataRouter = new RouterModule();

dataRouter.add('/list/:start/:limit', async function(next) {
  // info('data/list');
  info(this.context);
  await next();
});

dataRouter.add('/info/:id', async function(next) {
  info(this.context);
  await next();
});

mainRouter.add('/data', dataRouter);

mainRouter.run({path: '/data/list/0/10'}).catch(err => error('err', '/data/list', err));
mainRouter.run({path: '/data/info/1'}).catch(err => error('err', '/data/info', err));
mainRouter.run({path: '/index'}).catch(err => error('err', '/index', err));
mainRouter.run({path: '/index', method: 'POST'}).catch(err => error('err', '/index', err));

