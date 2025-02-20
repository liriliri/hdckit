import { ClientOptions } from '../ClientOptions'
import net, { Socket } from 'node:net'
import Emitter from 'licia/Emitter'

export default class Connection extends Emitter {
  socket!: Socket
  options: ClientOptions
  constructor(options: ClientOptions) {
    super()
    this.options = options
  }
  connect() {
    const socket = net.connect(this.options)
    socket.setNoDelay(true)

    this.socket = socket

    return new Promise((resolve, reject) => {
      socket.once('connect', resolve)
      socket.once('error', reject)
    })
  }
  end() {
    if (this.socket) {
      this.socket.end()
    }
  }
}
