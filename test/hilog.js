const { getTarget } = require('./util')

getTarget().then(async (target) => {
  const hilog = await target.openHilog()
  hilog.on('entry', (entry) => {
    console.log('receive hilog entry', entry)
  })
})
