import { ClientOptions } from '../ClientOptions'
import net, { Socket } from 'node:net'
import Emitter from 'licia/Emitter'
import ChannelHandShake from './ChannelHandShake'
import startWith from 'licia/startWith'

const HANDSHAKE_MESSAGE = 'OHOS HDC'

export default class Connection extends Emitter {
  socket!: Socket
  options: ClientOptions
  private ended = false
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
      socket.once('end', () => {
        this.ended = true
        this.socket = null
      })
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
  readBytes(howMany: number) {
    const { socket } = this

    let tryRead: () => void
    let errorListener: (error: Error) => void
    let endListener: () => void

    return new Promise<Buffer>((resolve, reject) => {
      tryRead = () => {
        if (howMany) {
          const chunk = socket.read(howMany)
          if (chunk) {
            howMany -= chunk.length
            if (howMany === 0) {
              return resolve(chunk)
            }
          }
          if (this.ended) {
            return reject(new Error('ended'))
          }
        } else {
          return resolve(Buffer.alloc(0))
        }
      }
      endListener = () => {
        this.ended = true
        return reject(new Error('ended'))
      }
      errorListener = (err) => reject(err)
      socket.on('readable', tryRead)
      socket.on('error', errorListener)
      socket.on('end', endListener)
      tryRead()
    }).finally(() => {
      socket.removeListener('readable', tryRead)
      socket.removeListener('error', errorListener)
      socket.removeListener('end', endListener)
    })
  }
  readValue(): Promise<Buffer> {
    return this.readBytes(4).then((value) => {
      const length = value.readUInt32BE(0)
      return this.readBytes(length)
    })
  }
  private async handshake() {
    const data = await this.readValue()
    const channelHandShake = new ChannelHandShake(data)
    if (!startWith(channelHandShake.banner, HANDSHAKE_MESSAGE)) {
      throw new Error('Channel Hello failed')
    }
    console.log('success')
  }
}
