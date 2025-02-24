export default class ChannelHandShake {
  banner: Buffer
  channelId: number
  connectKey: string = ''
  constructor(buf: Buffer) {
    this.banner = buf.subarray(0, 12)
    this.channelId = buf.readUInt32BE(12)
  }
  serialize() {
    const connectKey = Buffer.alloc(32)
    if (this.connectKey) {
      connectKey.write(this.connectKey)
    }
    return Buffer.concat([this.banner, connectKey])
  }
}
