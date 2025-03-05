import Client from './Client'
import GetParametersCommand from './command/GetParametersCommand'
import contain from 'licia/contain'
import waitUntil from 'licia/waitUntil'

export default class Target {
  readonly client: Client
  readonly connectKey: string
  private ready = false
  constructor(client: Client, connectKey: string) {
    this.client = client
    this.connectKey = connectKey
  }
  async transport() {
    if (!this.ready) {
      await this.waitForReady()
    }

    return this.client.connection(this.connectKey)
  }
  getParameters() {
    return this.transport().then((transport) =>
      new GetParametersCommand(transport).execute()
    )
  }
  async waitForReady() {
    await waitUntil(
      async () => {
        const transport = await this.client.connection(this.connectKey)
        transport.send(Buffer.from('shell echo ready\n'))
        const data = await transport.readAll()
        if (!contain(data.toString(), 'E000004')) {
          return true
        }

        return false
      },
      10000,
      1000
    )
    this.ready = true
  }
}
