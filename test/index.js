const expross = require('../')
const app = expross()
var router = expross.Router()
app.use(function (req, res, next) {
  console.log('time:' + Date.now().toString())
  next()
})
app.get('/a', function (req, res) {
  res.send('hello get')
})
app.get('/b', function (req, res) {
  res.send('hello get b')
})
app.post('/a', function (req, res) {
  res.send('hello post')
})

router.use('/1', function (req, res, next) {
  res.send('first user')
})

router.use('/2', function (req, res, next) {
  res.send('second user')
})
app.use('/users', router)

app.listen(3008, function () {
  console.log('app listening on 3008')
})
