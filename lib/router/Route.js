const Layer = require('./Layer')
const httpmethods = require('../util/httpmethods')
class Route {
  constructor (path) {
    this.path = path
    this.stack = []
    this.methods = {}
  }
  isHandledMethod (method) {
    let name = method.toLowerCase()
    return Boolean(this.methods[name])
  }
  // get (fn) {
  //   let layer = new Layer('/', fn)
  //   layer.method = 'get'
  //   this.methods['get'] = true
  //   this.stack.push(layer)
  //   return this
  // }
  dispatch (req, res, done) {
    // let that = this
    let method = req.method.toLowerCase()
    let index = 0
    let stack = this.stack
    // for (let i = 0, len = that.stack.length; i < len; i++) {
    //   if (method === that.stack[i].method) {
    //     return that.stack[i].handleRequest(req, res)
    //   }
    // }
    function next (err) {
      // 跳过route
      if (err && err === 'route') {
        return done()
      }
      if (err && err === 'router') {
        return done(err)
      }
      if (index >= stack.length) {
        return done(err)
      }
      let layer = stack[index++]
      if (method !== layer.method) {
        return next(err)
      }
      if (err) {
        layer.handleError(err, req, res, next)
      } else {
        layer.handleRequest(req, res, next)
      }
    }
    next()
  }
}
httpmethods.forEach(item => {
  let method = item.toLowerCase()
  Route.prototype[method] = function (fn) {
    let layer = new Layer('/', fn)
    layer.method = method
    this.methods[method] = true
    this.stack.push(layer)
    return this
  }
})

module.exports = Route
