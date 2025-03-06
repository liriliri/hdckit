const { getTarget } = require('./util')
const path = require('path')

getTarget().then(async (target) => {
  const fileName = 'file.js'
  const local = path.join(__dirname, fileName)
  await target.sendFile(local, '/data/local/tmp/')
})
