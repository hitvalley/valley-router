const debug = require('debug')('valley-rooter-demo');

const RouterModule = require('../src/index');

const mainRouter = new RouterModule();

mainRouter.add('/index', async next => {
  debug('index');
  await next();
});

const dataRouter = new RouterModule();

dataRouter.add('/list', async next => {
  debug('data/list');
  await next();
});

dataRouter.add('/info', async next => {
  debug('data/info');
  await next();
});

mainRouter.add('/data', dataRouter);

mainRouter.run({path: '/data/list'});
mainRouter.run({path: '/data/info'});
mainRouter.run({path: '/index'});
