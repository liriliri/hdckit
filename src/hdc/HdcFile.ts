import Connection from './Connection'
import { HdcCommand } from './types'

export default class HdcFile {
  private connection: Connection
  constructor(connection: Connection) {
    this.connection = connection
  }
  async beginTransfer(payload: Buffer) {
    const command = payload.toString()
    console.log(command)
  }
  async dispatchCommand(cmd: HdcCommand, payload: Buffer) {
    switch (cmd) {
      case HdcCommand.CMD_FILE_INIT:
        this.beginTransfer(payload)
        break
      default:
        break
    }
  }
}
