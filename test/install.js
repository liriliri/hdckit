const { getTarget } = require('./util')
const path = require('path')

getTarget().then(async (target) => {
  const hapFile = path.join(__dirname, 'test.hap')
  await target.install(hapFile)
})
