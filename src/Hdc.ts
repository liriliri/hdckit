import Client from './hdc/Client'
import { ClientOptions } from './types'
import isNaN from 'licia/isNaN'

interface Options {
  host?: string
  port?: number
  bin?: string
}

export default class Hdc {
  static createClient(options: Options = {}) {
    const opts: ClientOptions = {
      host: options.host,
      port: options.port,
      bin: options.bin,
    }

    if (!opts.port) {
      const port = parseInt(process.env.OHOS_HDC_SERVER_PORT || '8710', 10)
      if (!isNaN(port)) {
        opts.port = port
      }
    }

    return new Client(opts)
  }
}
