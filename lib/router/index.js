const Layer = require('./Layer')
const Route = require('./Route')
const httpmethods = require('../util/httpmethods')
const url = require('url')
class Router {
  constructor () {
    this.stack = []
    // this.stack = [
    //   new Layer('*', function (req, res) {
    //     res.writeHead(200, {
    //       'Content-Type': 'text/plain'
    //     })
    //     res.end('404')
    //   })
    // {
    //   path: '*',
    //   method: '*',
    //   handle: function (req, res) {
    //     res.writeHead(200, {
    //       'Content-Type': 'text/plain'
    //     })
    //     res.end('404')
    //   }
    // }
    // ]
  }
  // get (path, fn) {
  //   // this.stack.push(new Layer(path, fn))
  //   let route = this.route(path)
  //   route.get(fn)
  //   return this
  // }
  handle (req, res, done) {
    // let that = this
    // let method = req.method
    let index = 0
    let stack = this.stack
    // let that = this
    let removed = ''
    let slashAdded = false

    let parentUrl = req.baseUrl || ''
    // 父级路径
    req.baseUrl = parentUrl
    // 原始请求路径
    req.orginalUrl = req.orginalUrl || req.url

    function next (err) {
      let layerError = err === 'route' ? null : err

      if (slashAdded) {
        req.url = ''
        slashAdded = false
      }
      if (removed.length !== 0) {
        req.baseUrl = parentUrl
        req.url = removed + req.url
        removed = ''
      }
      // 跳过路由系统
      if (layerError === 'router') {
        return done(null)
      }
      if (index > stack.length) {
        return done(layerError)
      }
      let path = url.parse(req.url).pathname
      let layer = stack[index++]
      if (layer.match(path)) {
        if (!layer.route) {
          // 移除的部分路径
          removed = layer.path
          // 设置当前路径
          req.url = req.url.substr(removed.length)
          if (req.url === '') {
            req.url = '/' + req.url
            slashAdded = true
          }
          req.baseUrl = parentUrl + removed
          if (layerError) {
            layer.handleError(layerError, req, res, next)
          } else {
            layer.handleRequest(req, res, next)
          }
        } else if (layer.route.isHandledMethod) {
          layer.handleRequest(req, res, next)
        }
      } else {
        layer.handleError(layerError, req, res, next)
      }
    }
    next()
    // for (let i = 0; i < this.stack.length; i++) {
    //   // 判断url，判断route，和method
    //   if (that.stack[i].match(req.url) &&
    //   that.stack[i].route &&
    //   that.stack[i].route.isHandledMethod(req.method)) {
    //     return that.stack[i].handleRequest(req, res)
    //   }
    // }
    // return this.stack[0].handleRequest(req, res)
  }
  route (path) {
    let route = new Route(path)
    // let layer = new Layer(path, (req, res) => {
    //   route.dispatch(req, res)
    // })
    let layer = new Layer(path, route.dispatch.bind(route))
    layer.route = route
    this.stack.push(layer)
    return route
  }
  use (fn) {
    let path = '/'
    if (typeof fn !== 'function') {
      path = fn
      fn = arguments[1]
    }
    let layer = new Layer(path, fn)
    layer.route = undefined
    this.stack.push(layer)
    return this
  }
}
// 拓展Router类上的处理方法
httpmethods.forEach(item => {
  let method = item.toLowerCase()
  Router.prototype[method] = function (path, fn) {
    let route = this.route(path)
    // theroute[method](fn)
    route[method](fn)
    return this
  }
})
// console.log(Router)
// exports = module.exports = Router
exports = module.exports = function () {
  function router (req, res, next) {
    router.handle(req, res, next)
  }
  Object.setPrototypeOf(router, new Router())
  // router.stack = []
  // console.log('router', router)
  return router
}
