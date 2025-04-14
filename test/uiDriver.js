const { getTarget } = require('./util')

getTarget().then(async (target) => {
  target.createUiDriver()
})
