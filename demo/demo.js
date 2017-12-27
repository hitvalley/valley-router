const debug = require('debug');
const info = debug('valley-rooter-demo:info');
const error = debug('valley-rooter-demo:error');

const RouterModule = require('../src/index');

const mainRouter = new RouterModule();

mainRouter.add('/index', async next => {
  info('index');
  await next();
});

const dataRouter = new RouterModule();

dataRouter.add('/list', async next => {
  info('data/list');
  await next();
});

dataRouter.add('/info', ['INPUT'], async next => {
  info('data/info');
  await next();
});

mainRouter.add('/data', dataRouter);

mainRouter.run({path: '/data/list'}).catch(err => error('err', '/data/list', err));
mainRouter.run({path: '/data/info'}).catch(err => error('err', '/data/info', err));
mainRouter.run({path: '/index'}).catch(err => error('err', '/index', err));
mainRouter.run({path: '/index', method: 'POST'}).catch(err => error('err', '/index', err));

