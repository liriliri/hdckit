import { ClientOptions } from '../types'
import ListTargetsCommand from './command/ListTargetsCommand'
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
      new ListTargetsCommand(conn).execute()
    )
  }
  getTarget(connectKey: string) {
    return new Target(this, connectKey)
  }
}
