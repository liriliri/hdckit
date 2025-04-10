import { ClientOptions } from '../types'
import ListTargetsCommand from './command/ListTargetsCommand'
import Connection from './Connection'
import Target from './Target'
import isStrBlank from 'licia/isStrBlank'
import { getLastPid } from './util'
import TrackTargetsCommand from './command/TrackTargetsCommand'

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
  trackTargets() {
    return this.connection().then((conn) =>
      new TrackTargetsCommand(conn).execute()
    )
  }
  getTarget(connectKey: string) {
    if (isStrBlank(connectKey)) {
      throw new Error('connectKey is required')
    }

    return new Target(this, connectKey)
  }
  async kill() {
    const pid = await getLastPid()
    if (pid) {
      try {
        process.kill(pid, 'SIGKILL')
        // eslint-disable-next-line
      } catch (e) {}
    }
  }
}
