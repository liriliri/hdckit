import os from 'node:os'
import isUndef from 'licia/isUndef'

type StructDefinition = { [key: string]: string }
type Options = { litterEndian?: boolean }

export default class Struct {
  private structDefinition: StructDefinition
  private littleEndian = os.endianness() === 'LE'

  constructor(structDefinition: StructDefinition, options: Options = {}) {
    this.structDefinition = structDefinition
    if (!isUndef(options.litterEndian)) {
      this.littleEndian = true
    }
  }

  unpack(buffer: Buffer): any {
    const data: any = {}
    let offset = 0

    for (const key in this.structDefinition) {
      const [type, length] = this.structDefinition[key].split(':')
      const size = parseInt(length, 10)

      if (type === 'string') {
        data[key] = buffer
          .toString('utf-8', offset, offset + size)
          .replace(/\0/g, '')
        offset += size
      } else if (type === 'uint32') {
        data[key] = this.littleEndian
          ? buffer.readUInt32LE(offset)
          : buffer.readUInt32BE(offset)
        offset += 4
      } else if (type === 'buffer') {
        data[key] = buffer.subarray(offset, offset + size)
        offset += size
      }
    }

    return data
  }

  pack(data: any): Buffer {
    const buffers: Buffer[] = []

    for (const key in this.structDefinition) {
      const [type, length] = this.structDefinition[key].split(':')
      const size = parseInt(length, 10)

      if (type === 'string') {
        const buffer = Buffer.alloc(size)
        buffer.write(data[key], 'utf-8')
        buffers.push(buffer)
      } else if (type === 'uint32') {
        const buffer = Buffer.alloc(4)
        if (this.littleEndian) {
          buffer.writeUInt32LE(data[key])
        } else {
          buffer.writeUInt32BE(data[key])
        }
        buffers.push(buffer)
      } else if (type === 'buffer') {
        buffers.push(data[key])
      }
    }

    return Buffer.concat(buffers)
  }
}
