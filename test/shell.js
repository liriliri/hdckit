const { getTarget } = require('./util')

getTarget().then(async (target) => {
  const connection = await target.shell('echo hello')
  console.log((await connection.readAll()).toString())
})
