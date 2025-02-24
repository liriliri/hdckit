const { Hdc } = require('../')

let client

function getHdcClient() {
  if (client) {
    return client
  }

  client = Hdc.createClient()

  return client
}

module.exports = {
  getHdcClient,
}
