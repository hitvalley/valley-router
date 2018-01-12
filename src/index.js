// const ValleyModule = require('valley-module');
// const pathToRegexp = require('path-to-regexp');
// const debug = require('debug')('valley-rooter');
import ValleyModule from 'valley-module';
import pathToRegexp from 'path-to-regexp';
import Debug from 'debug';

const debug = Debug('valley-rooter');
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
    this.use('info', async function(next){
      // console.log(this.context.req);
      let req = this.context.req;
      if (req) {
        this.context.path = req.url;
        this.context.method = req.method;
      } else if (!this.context.path) {
        this.context.path = location.pathname;
      }
      await next();
    });
    this.use('route', async function(next) {
      let path = this.context.path;
      let method = this.context.method || 'GET';
      let values = null;
      let params = {};
      let routers = this.routers.filter(item => {
        let res = (item.methods.indexOf(method) >= 0) && item.rule.exec(path);
        if (res && !values) {
          values = res;
        }
        return res;
      });
      let router = routers.shift();
      if (router && router.router) {
        router.keys.forEach((key, index) => {
          params[key] = values[index + 1];
        });
        this.context.params = params;
        if (router.router instanceof ValleyModule) {
          await router.router.run(this.context).catch(err => {
            this.context.response = this.context.response || {
              state: 500,
              text: err.message
            };
          });
        } else {
          try {
            await router.router.call(this, next);
          } catch(err) {
            this.context.response = this.context.response || {
              state: 500,
              text: err.message
            };
          }
        }
        await next();
      } else {
        this.context.response = {
          state: 404
        };
      }
    });
  }
  setPrefix(prefix) {
    this.prefix = prefix;
    this.routers = this.routers.map(item => {
      let wholePath = prefix + item.path;
      let keys = [];
      item.rule = pathToRegexp(wholePath, keys, { end: item.end });
      return item;
    });
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
      keys: keys.map(item => item.name),
      router
    });
  }
  get(path, router) {
    this.add(path, 'GET', router);
  }
  post(path, router) {
    this.add(path, 'POST', router);
  }
}

// module.exports = RouterModule;
export default RouterModule;
