const { getHdcClient } = require('./util')

;(async () => {
  const client = getHdcClient()
  await client.kill()
})()
