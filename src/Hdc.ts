import Client from './hdc/Client'
import { ClientOptions } from './ClientOptions'

interface Options {
  host?: string
  port?: number
  timeout?: number
}

export default class Hdc {
  static createClient(options: Options = {}) {
    const opts: ClientOptions = {
      host: options.host,
      port: options.port,
    }

    return new Client(opts)
  }
}
