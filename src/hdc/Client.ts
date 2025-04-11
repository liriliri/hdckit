import { ClientOptions } from '../types'
import Connection from './Connection'
import Target from './Target'
import isStrBlank from 'licia/isStrBlank'
import { getLastPid } from './util'
import { ListTargetsCommand, TrackTargetsCommand } from './command/targets'
import { ListForwardsCommand, IForward } from './command/forward'
import Tracker from './Tracker'
import { ListReversesCommand } from './command/reverse'

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
  listTargets(): Promise<string[]> {
    return this.connection().then((conn) =>
      new ListTargetsCommand(conn).execute()
    )
  }
  trackTargets(): Promise<Tracker> {
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
  listForwards(): Promise<IForward[]> {
    return this.connection().then((conn) =>
      new ListForwardsCommand(conn).execute()
    )
  }
  listReverses(): Promise<IForward[]> {
    return this.connection().then((conn) =>
      new ListReversesCommand(conn).execute()
    )
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
