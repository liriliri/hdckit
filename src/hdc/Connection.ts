import { ClientOptions } from '../ClientOptions'
import net, { Socket } from 'node:net'
import Emitter from 'licia/Emitter'

const HANDSHAKE_MESSAGE = 'OHOS HDC'

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
      socket.once('connect', async () => {
        const data = await this.read()
        console.log(data, data.toString())
      })
      socket.once('error', reject)
    })
  }
  end() {
    if (this.socket) {
      this.socket.end()
    }
  }
  write(data: Buffer) {
    this.socket.write(data)
  }
  read(): Promise<Buffer> {
    const { socket } = this

    return new Promise((resolve, reject) => {
      socket.once('data', resolve)
      socket.once('error', reject)
    })
  }
}
