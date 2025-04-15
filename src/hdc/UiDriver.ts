import path from 'path'
import trim from 'licia/trim'
import contain from 'licia/contain'
import Target from './Target'
import cmpVersion from 'licia/cmpVersion'
import toNum from 'licia/toNum'
import getPort from 'licia/getPort'
import strHash from 'licia/strHash'
import now from 'licia/now'
import net, { Socket } from 'node:net'
import Emitter from 'licia/Emitter'

const SDK_PATH = path.join(
  __dirname,
  '../../uitestkit_sdk/uitest_agent_v1.1.0.so'
)
const SDK_VERSION = '1.1.0'
const AGENT_PATH = '/data/local/tmp/agent.so'

export default class UiDriver extends Emitter {
  private readonly target: Target
  private connection: Connection = null
  private port: number = 0
  private sdkVersion = SDK_VERSION
  private sdkPath = SDK_PATH
  private captureScreenCallback: (sessionId: number, message: Buffer) => void =
    null
  constructor(target: Target, sdkPath?: string, sdkVersion?: string) {
    super()
    this.target = target
    if (sdkPath) {
      this.sdkPath = sdkPath
    }
    if (sdkVersion) {
      this.sdkVersion = sdkVersion
    }
  }
  async start() {
    let uiTestPid = trim(await this.shell('pidof uitest'))
    const shouldUpdateSdk = await this.shouldUpdateSdk()
    if (!uiTestPid || shouldUpdateSdk) {
      if (shouldUpdateSdk) {
        if (uiTestPid) {
          await this.shell(`kill -9 ${uiTestPid}`)
          uiTestPid = ''
        }
        await this.updateSdk()
      }

      if (!uiTestPid) {
        await this.shell('uitest start-daemon singleness')
      }
    }

    this.port = await this.forwardTcp(8012)
  }
  async stop() {
    if (this.connection) {
      this.connection.end()
      this.connection = null
    }
    const uiTestPid = trim(await this.shell('pidof uitest'))
    if (uiTestPid) {
      await this.shell(`kill -9 ${uiTestPid}`)
    }
  }
  async startCaptureScreen(callback: (message: Buffer) => void) {
    const { sessionId } = await this.send({
      module: 'com.ohos.devicetest.hypiumApiHelper',
      method: 'Captures',
      params: {
        api: 'startCaptureScreen',
        args: {},
      },
    })
    if (this.captureScreenCallback) {
      throw new Error('Capture screen is already started')
    }
    this.captureScreenCallback = (id, message) => {
      if (id === sessionId) {
        callback(message)
      }
    }
    this.on('message', this.captureScreenCallback)
  }
  async stopCaptureScreen() {
    await this.send({
      module: 'com.ohos.devicetest.hypiumApiHelper',
      method: 'Captures',
      params: {
        api: 'stopCaptureScreen',
        args: {},
      },
    })
    if (this.captureScreenCallback) {
      this.off('message', this.captureScreenCallback)
      this.captureScreenCallback = null
    }
  }
  captureLayout() {
    return this.send({
      module: 'com.ohos.devicetest.hypiumApiHelper',
      method: 'Captures',
      params: {
        api: 'captureLayout',
        args: {},
      },
    }).then(({ message }) => message.result)
  }
  private async send(message: any): Promise<any> {
    if (!this.connection) {
      await this.start()
      this.connection = new Connection()
      this.connection.setOnMessage((sessionId, message) => {
        this.emit('message', sessionId, message)
      })
      await this.connection.connect(this.port)
      this.connection.socket.on('end', () => {
        this.stop()
      })
    }
    return this.connection.sendMessage(message)
  }
  private async forwardTcp(p: number) {
    const { target } = this
    const remote = `tcp:${p}`
    const forwards = await target.listForwards()

    for (let i = 0, len = forwards.length; i < len; i++) {
      const forward = forwards[i]
      if (forward.remote === remote) {
        return toNum(forward.local.replace('tcp:', ''))
      }
    }

    const port = await getPort()
    const local = `tcp:${port}`
    await target.forward(local, remote)

    return port
  }
  private async shouldUpdateSdk() {
    const result = await this.shell(
      `cat ${AGENT_PATH} | grep -a UITEST_AGENT_LIBRARY`
    )
    if (!contain(result, 'UITEST_AGENT_LIBRARY')) {
      return true
    }
    const deviceSdkVersion = getSdkVersion(result)
    return cmpVersion(deviceSdkVersion, this.sdkVersion) < 0
  }
  private async updateSdk() {
    await this.shell(`rm ${AGENT_PATH}`)
    await this.target.sendFile(this.sdkPath, AGENT_PATH)
  }
  private async shell(command: string) {
    const connection = await this.target.shell(command)
    return (await connection.readAll()).toString()
  }
}

const HEADER_BYTES = Buffer.from('_uitestkit_rpc_message_head_')
const TAILER_BYTES = Buffer.from('_uitestkit_rpc_message_tail_')

type OnMessage = (sessionId: number, message: Buffer) => void

class Connection {
  socket!: Socket
  private onMessage: OnMessage
  private ended = false
  private resolves: Map<number, (value?: any) => void> = new Map()
  private buffer: Buffer = Buffer.alloc(0)
  connect(port: number) {
    const socket = net.connect({
      host: '127.0.0.1',
      port,
    })
    socket.setNoDelay(true)

    this.socket = socket

    return new Promise((resolve, reject) => {
      socket.once('connect', async () => {
        socket.on('data', this.onData)
        resolve(null)
      })
      socket.once('error', reject)
      socket.once('end', () => {
        this.ended = true
        this.socket = null
      })
    })
  }
  setOnMessage(onMessage: OnMessage) {
    this.onMessage = onMessage
  }
  sendMessage(message: any) {
    message = JSON.stringify(message)
    const sessionId = strHash(now() + message)
    const sessionIdBuf = Buffer.alloc(4)
    sessionIdBuf.writeUInt32BE(sessionId, 0)
    this.sendRawMessage(sessionIdBuf, Buffer.from(message))
    return new Promise((resolve) => {
      this.resolves.set(sessionId, resolve)
    })
  }
  sendRawMessage(sessonId: Buffer, message: Buffer) {
    if (this.ended) {
      throw new Error('ended')
    }
    const buffers: Buffer[] = []
    buffers.push(HEADER_BYTES)
    buffers.push(sessonId)
    const len = Buffer.alloc(4)
    len.writeUInt32BE(message.length, 0)
    buffers.push(len)
    buffers.push(message)
    buffers.push(TAILER_BYTES)
    this.socket.write(Buffer.concat(buffers))
  }
  end() {
    if (this.socket) {
      this.socket.end()
    }
  }
  private onData = (data: Buffer) => {
    let buffer = this.buffer
    buffer = Buffer.concat([buffer, data])

    while (buffer.length >= HEADER_BYTES.length + 8) {
      const headerBytes = buffer.subarray(0, HEADER_BYTES.length)
      if (headerBytes.compare(HEADER_BYTES) !== 0) {
        buffer = Buffer.alloc(0)
        break
      }

      if (buffer.length < HEADER_BYTES.length + 8) {
        break
      }

      const sessionId = buffer.readUInt32BE(HEADER_BYTES.length)
      const len = buffer.readUInt32BE(HEADER_BYTES.length + 4)

      const totalLength = HEADER_BYTES.length + 8 + len + TAILER_BYTES.length
      if (buffer.length < totalLength) {
        break
      }

      const start = HEADER_BYTES.length + 8
      const end = start + len
      const message = buffer.subarray(start, end)

      const tailerBytes = buffer.subarray(end, end + TAILER_BYTES.length)
      if (tailerBytes.compare(TAILER_BYTES) !== 0) {
        buffer = Buffer.alloc(0)
        break
      }

      const resolve = this.resolves.get(sessionId)
      if (resolve) {
        resolve({ sessionId, message: JSON.parse(message.toString()) })
        this.resolves.delete(sessionId)
      } else if (this.onMessage) {
        this.onMessage(sessionId, message)
      }

      buffer = this.buffer.subarray(totalLength)
    }

    this.buffer = buffer
  }
}

function getSdkVersion(raw: string) {
  return trim(raw.slice(raw.indexOf('@v') + 2))
}
