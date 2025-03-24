import Command from '../Command'
import HdcFile from '../HdcFile'
import { HdcCommand } from '../types'

export default class FileSendCommand extends Command<void> {
  async execute(local: string, remote: string) {
    const cwd = process.cwd()
    this.send(`file send remote -cw "${cwd}" ${local} ${remote}`)
    const file = new HdcFile(this.connection)
    let cmd = 0
    do {
      const data = await this.connection.readValue()
      cmd = data.readUInt16LE()
      await file.dispatchCommand(cmd, data.subarray(2))
    } while (cmd !== HdcCommand.CMD_FILE_FINISH)
  }
}
