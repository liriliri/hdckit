export default class ChannelHandShake {
  banner: Buffer
  channelId: number
  connectKey: string
  version: string
  constructor(buf: Buffer) {
    this.banner = buf.slice(0, 12)
    this.channelId = buf.readUInt32BE(12)
    this.connectKey = ''
    this.version = ''
  }
  serialize() {
    return Buffer.concat([this.banner, Buffer.alloc(32)])
  }
}
