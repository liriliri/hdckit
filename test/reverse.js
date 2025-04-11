const { getTarget, getHdcClient } = require('./util')

getTarget().then(async (target) => {
  await target.reverse('tcp:9222', 'tcp:9223')
  const client = await getHdcClient()
  console.log(await client.listReverses())
  await target.removeReverse('tcp:9222', 'tcp:9223')
  console.log(await target.listReverses())
})
