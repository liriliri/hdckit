import Struct from './Struct'

const MAX_CONNECTKEY_SIZE = 32

const ChannelHandShakeChannelIdStruct = new Struct({
  banner: 'buffer:12',
  channelId: 'uint32',
})

const ChannelHandShakeConnectKeyStruct = new Struct({
  banner: 'buffer:12',
  connectKey: `string:${MAX_CONNECTKEY_SIZE}`,
})

export default class ChannelHandShake {
  banner: Buffer
  connectKey = ''
  constructor(buf: Buffer) {
    const { banner } = ChannelHandShakeChannelIdStruct.unpack(buf)
    this.banner = banner
  }
  serialize() {
    return ChannelHandShakeConnectKeyStruct.pack({
      banner: this.banner,
      connectKey: this.connectKey,
    })
  }
}
