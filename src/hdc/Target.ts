import Client from './Client'
import GetParametersCommand from './command/GetParametersCommand'

export default class Target {
  readonly client: Client
  readonly connectKey: string
  constructor(client: Client, connectKey: string) {
    this.client = client
    this.connectKey = connectKey
  }
  transport() {
    return this.client.connection(this.connectKey)
  }
  getParameters() {
    return this.transport().then((transport) =>
      new GetParametersCommand(transport).execute()
    )
  }
}
