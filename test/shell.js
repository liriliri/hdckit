const { getTarget } = require('./util')

getTarget().then(async (target) => {
  const connection = await target.shell('SP_daemon -deviceinfo')
  console.log((await connection.readAll()).toString())
})
