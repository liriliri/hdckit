import { ClientOptions } from '../types'
import ListDevicesCommand from './command/ListDevicesCommand'
import Connection from './Connection'
import Target from './Target'

export default class Client {
  readonly options: ClientOptions
  constructor(
    { host = '127.0.0.1', port = 8710, bin = 'hdc' }: ClientOptions = {
      port: 5037,
    }
  ) {
    this.options = { host, port, bin }
  }
  connection(connectKey?: string) {
    const connection = new Connection(this.options)
    return connection.connect(connectKey)
  }
  listTargets() {
    return this.connection().then((conn) =>
      new ListDevicesCommand(conn).execute()
    )
  }
  getTarget(connectKey: string) {
    return new Target(this, connectKey)
  }
}
