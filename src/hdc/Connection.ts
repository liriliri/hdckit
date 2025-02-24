import { ClientOptions } from '../ClientOptions'
import net, { Socket } from 'node:net'
import Emitter from 'licia/Emitter'
import ChannelHandShake from './ChannelHandShake'
import startWith from 'licia/startWith'

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
        try {
          await this.handshake()
        } catch (e) {
          reject(e)
        }
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
  async handshake() {
    const data = await this.read()
    const channelHandShake = new ChannelHandShake(data)
    if (!startWith(channelHandShake.banner, HANDSHAKE_MESSAGE)) {
      throw new Error('Channel Hello failed')
    }
    console.log('success')
  }
}
