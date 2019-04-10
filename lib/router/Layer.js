class Layer {
  constructor (path, fn) {
    this.handle = fn
    this.name = fn.name || '<anonymous>'
    this.path = undefined
    // 判断path是否为*
    this.fastStar = path === '*'
    if (!this.fastStar) {
      this.path = path
    }
  }
  handleRequest (req, res, next) {
    let fn = this.handle
    try {
      fn(req, res, next)
    } catch (err) {
      next(err)
    }
    // this.handle && this.handle(req, res)
  }
  handleError (error, req, res, next) {
    let fn = this.handle
    if (fn.length !== 4) {
      return next(error)
    }
    try {
      fn(error, req, res, next)
    } catch (err) {
      next(err)
    }
  }
  match (path) {
    // console.log('path', path)
    // console.log('this.path', this.path)
    // 如果为*，匹配
    if (this.fastStar) {
      this.path = ''
      return true
    }
    // 如果是普通路由，从后匹配
    if (this.route && this.path === path.slice(-this.path.length)) {
      return true
    }
    if (!this.route) {
      // 不带路径的中间件
      if (this.path === '/') {
        this.path = ''
        return true
      }

      // 带路径中间件
      if (this.path === path.slice(0, this.path.length)) {
        return true
      }
    }
    return false
  }
}
module.exports = Layer
