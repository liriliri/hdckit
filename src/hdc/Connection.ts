import { ClientOptions } from '../types'
import net, { Socket } from 'node:net'
import Emitter from 'licia/Emitter'
import ChannelHandShake from './ChannelHandShake'
import startWith from 'licia/startWith'
import { execFile } from 'node:child_process'
import util from 'node:util'
import toStr from 'licia/toStr'

const HANDSHAKE_MESSAGE = 'OHOS HDC'

export default class Connection extends Emitter {
  socket!: Socket
  options: ClientOptions
  private triedStarting = false
  private ended = false
  constructor(options: ClientOptions) {
    super()
    this.options = options
  }
  connect(connectKey?: string) {
    const socket = net.connect(this.options)
    socket.setNoDelay(true)

    this.socket = socket

    return new Promise((resolve, reject) => {
      socket.once('connect', async () => {
        try {
          await this.handshake(connectKey)
          resolve(null)
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
      .catch((e) => {
        if (e.code === 'ECONNREFUSED' && !this.triedStarting) {
          this.triedStarting = true
          return this.startServer().then(() => {
            return this.connect(connectKey)
          })
        } else {
          this.end()
          throw e
        }
      })
      .then(() => this)
  }
  end() {
    if (this.socket) {
      this.socket.end()
    }
  }
  write(data: Buffer) {
    return new Promise((resolve, reject) => {
      this.socket.write(data, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve(null)
        }
      })
    })
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
  async readAll() {
    let all = Buffer.alloc(0)

    while (true) {
      try {
        const chunk = await this.readValue()
        all = Buffer.concat([all, chunk])
      } catch (e) {
        if (this.ended) {
          return all
        }
        throw e
      }
    }
  }
  async send(data: Buffer) {
    const len = Buffer.alloc(4)
    len.writeUInt32BE(data.length, 0)
    await this.write(Buffer.concat([len, data]))
  }
  private async handshake(connectKey?: string) {
    const data = await this.readValue()
    const channelHandShake = new ChannelHandShake()
    channelHandShake.deserialize(data)
    if (
      !startWith(channelHandShake.banner.toString('utf8'), HANDSHAKE_MESSAGE)
    ) {
      throw new Error('Channel Hello failed')
    }
    if (connectKey) {
      channelHandShake.connectKey = connectKey
    }
    await this.send(channelHandShake.serialize())
  }
  private async startServer() {
    const { port, bin } = this.options
    return util.promisify(execFile)(bin, ['start'], {
      env: {
        ...process.env,
        OHOS_HDC_SERVER_PORT: toStr(port),
      },
    })
  }
}
