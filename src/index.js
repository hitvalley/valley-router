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
      let routers = this.routers.filter(item => {
        let res = item.rule.exec(path)
        return res;
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
  add(path, router) {
    // if (typeof method === 'string') {
      // method = method.toUpperCase();
      // method = method === 'ALL' ? Object.assign([], METHODS) : [method];
    // }
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
      rule,
      end,
      router
    });
  }
}

module.exports = RouterModule;
