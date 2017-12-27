const ValleyModule = require('valley-module');
const pathToRegexp = require('path-to-regexp');
const debug = require('debug')('valley-rooter');

const METHODS = [
  'HEAD',
  'OPTIONS',
  'GET',
  'PUT',
  'PATCH',
  'POST',
  'DELETE'
];

class RouterModule extends ValleyModule {
  constructor(input) {
    super(input);
    input = input || {};
    this.routers = [];
    this.prefix = input.prefix || '';
  }
  prepare() {
    this.use('route', async function(next) {
      let path = this.context.path;
      let method = this.context.method || 'GET';
      let routers = this.routers.filter(item => {
        return item.rule.exec(path) && (item.methods.indexOf(method) >= 0)
      });
      let router = routers.shift();
      if (router && router.router) {
        if (router.router instanceof ValleyModule) {
          await router.router.run(this.context);
        } else {
          await router.router.call(this, next);
        }
      } else {
        return Promise.reject('404');
      }
      await next();
    });
  }
  setPrefix(prefix) {
    this.prefix = prefix;
    this.routers = this.routers.map(item => {
      let wholePath = prefix + item.path;
      let keys = [];
      item.rule = pathToRegexp(wholePath, keys, { end: item.end });
      return item;
    })
  }
  add(path, methods, router) {
    let type = typeof methods;
    if (type === 'string') {
      methods = methods.toUpperCase();
      methods = methods === 'ALL' ? Object.assign([], METHODS) : [methods];
    } else if (methods instanceof ValleyModule || type === 'function') {
      router = methods;
      methods = ['GET'];
    }
    let wholePath = this.prefix + path;
    let end = false;
    let keys = [];
    if (ValleyModule.isPrototypeOf(router)) {
      router = new router({
        prefix: wholePath
      });
    } else if (router instanceof ValleyModule) {
      router.setPrefix(wholePath);
    } else {
      end = true;
    }
    let rule = pathToRegexp(wholePath, keys, { end });
    debug(`${wholePath}, ${rule}`);
    this.routers.push({
      path: wholePath,
      methods,
      rule,
      end,
      router
    });
  }
}

module.exports = RouterModule;
