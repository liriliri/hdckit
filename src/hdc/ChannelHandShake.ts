export default class ChannelHandShake {
  length: number
  banner: string
  channelId: number
  connectKey: string
  version: string
  constructor(buf: Buffer) {
    this.length = buf.readUInt32BE(0)
    this.banner = buf.toString('utf8', 4, 16)
    this.channelId = buf.readUInt32BE(16)
    this.connectKey = ''
    this.version = ''
  }
}
