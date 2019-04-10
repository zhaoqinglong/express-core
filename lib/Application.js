const http = require('http')
const Router = require('./router/index')
const middleware = require('./middleware/init')
// const request = require('./request')
// const response = require('./response')
class Application {
  // constructor () {
  //   this._router = new Router()
  // }
  // get (path, fn) {
  //   return this._router.get(path, fn)
  // }
  lazyrouter () {
    if (!this._router) {
      this._router = new Router()
      this._router.use(middleware.init)
    }
  }
  listen (port, callback) {
    // let that = this
    var server = http.createServer((req, res) => {
      // 箭头函数的this 指向Application 类
      this.handle(req, res)
    })
    return server.listen.apply(server, arguments)
  }
  handle (req, res) {
    // Object.setPrototypeOf(req, request)
    // Object.setPrototypeOf(res, response)
    // if (!res.send) {
    //   res.send = function (body) {
    //     res.writeHead(200, { 'Content-Type': 'text/plain' })
    //     res.end(body)
    //   }
    // }

    var done = function finalHandler (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      if (err) {
        res.end('404:' + err)
      } else {
        res.end(`cannot ${req.method} ${req.url}`)
      }
    }
    let router = this._router
    if (router) {
      router.handle(req, res, done)
    } else {
      done()
    }
  }
  use (fn) {
    let path = '/'
    if (typeof fn !== 'function') {
      path = fn
      fn = arguments[1]
    }
    this.lazyrouter()
    this._router.use(path, fn)
    return this
  }
}
// console.log(http.METHODS)
// 向Application上添加方法
http.METHODS.forEach(method => {
  let methodVerb = method.toLowerCase()
  Application.prototype[methodVerb] = function (path, fn) {
    this.lazyrouter()
    this._router[methodVerb].apply(this._router, arguments)
    return this
  }
})
// console.log(Application)
exports = module.exports = Application
