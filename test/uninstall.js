const { getTarget } = require('./util')

getTarget().then(async (target) => {
  await target.uninstall(process.argv[2])
})
