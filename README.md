# valley-router
router for valley-module

## run demo
```
npm i valley-router
npm run demo
```

## 服务器端运行

### 引入

```
npm i valley-router
npm i valley-server
```

### 代码
```
const ValleyServer = require('valley-server');
const ValleyRouter = require('valley-router');

const server = new ValleyServer();

const router = new ValleyRouter();
router.add('/info/:id', async function() {
  this.context.text('<div>' + (
    () => [
      this.context.path,
      this.context.method,
      JSON.stringify(this.context.params)
    ].join(' - ')
  )() + '</div>');
});

server.use('router', router);
server.use('404', async function(next){
  this.context.text('404');
  await next();
});

server.listen({
  port: 3000
}).then(res => console.log('http://localhost:3000'));
```
### 结果

1. 访问 http://localhost:3000/info/1 得到页面
2. 访问其他页面会得到 404
