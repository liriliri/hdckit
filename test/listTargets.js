const { getHdcClient } = require('./util')

;(async () => {
  const client = getHdcClient()
  console.log(await client.listTargets())
})()
