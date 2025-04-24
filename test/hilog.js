const { getTarget } = require('./util')

getTarget().then(async (target) => {
  const hilog = await target.openHilog({ clear: true })
  let count = 0
  hilog.on('entry', (entry) => {
    console.log('receive hilog entry', count++, entry)
  })
})
