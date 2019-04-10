const Application = require('./Application')
const Router = require('./router')
function createApplication () {
  return new Application()
}
exports = module.exports = createApplication
exports.Router = Router
