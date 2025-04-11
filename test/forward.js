const { getTarget, getHdcClient } = require('./util')

getTarget().then(async (target) => {
  await target.forward('tcp:9222', 'tcp:9223')
  const client = await getHdcClient()
  console.log(await client.listForwards())
  await target.removeForward('tcp:9222', 'tcp:9223')
  console.log(await target.listForwards())
})
