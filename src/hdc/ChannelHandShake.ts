export default class ChannelHandShake {
  banner: string
  channelId: number
  connectKey: string
  version: string
  constructor(buf: Buffer) {
    this.banner = buf.toString('utf8', 0, 12)
    this.channelId = buf.readUInt32BE(12)
    this.connectKey = ''
    this.version = ''
  }
}
