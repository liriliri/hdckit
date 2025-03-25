const MAX_CONNECTKEY_SIZE = 32

export default class ChannelHandShake {
  banner: Buffer
  channelId = 0
  connectKey = ''
  deserialize(buf: Buffer) {
    let offset = 0

    this.banner = buf.subarray(0, 12)
    offset += 12

    this.channelId = buf.readUInt32BE(offset)
  }
  serialize() {
    const buffers: Buffer[] = []

    buffers.push(this.banner)

    const connectKey = Buffer.alloc(MAX_CONNECTKEY_SIZE)
    connectKey.write(this.connectKey)
    buffers.push(connectKey)

    return Buffer.concat(buffers)
  }
}
