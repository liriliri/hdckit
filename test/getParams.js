const { getTarget } = require('./util')

getTarget().then(async (target) => {
  console.log(await target.getParameters())
})
