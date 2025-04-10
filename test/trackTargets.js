const { getHdcClient } = require('./util')

;(async () => {
  const client = getHdcClient()
  const tracker = await client.trackTargets()
  tracker.on('add', (target) => {
    console.log('target added', target)
  })
  tracker.on('remove', (target) => {
    console.log('target removed', target)
  })
  setTimeout(() => {
    console.log('end')
    tracker.end()
  }, 10000)
})()
