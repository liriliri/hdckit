const { Hdc } = require('../')
const isEmpty = require('licia/isEmpty')

let client

function getHdcClient() {
  if (client) {
    return client
  }

  client = Hdc.createClient()

  return client
}

async function getTarget() {
  const client = getHdcClient()
  const targets = await client.listTargets()
  if (!isEmpty(targets)) {
    return client.getTarget(targets[0])
  }
  throw new Error('No target found')
}

module.exports = {
  getHdcClient,
  getTarget,
}
