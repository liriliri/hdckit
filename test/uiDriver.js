const { getTarget } = require('./util')

getTarget().then(async (target) => {
  const uiDriver = await target.createUiDriver()
  console.log(await uiDriver.getDisplaySize())
  await uiDriver.stopCaptureScreen()
  uiDriver.startCaptureScreen((image) => {
    console.log('receive capture screen image', image.length)
  })
  const layout = await uiDriver.captureLayout()
  console.log(layout)
})
