import Command from '../Command'

export default class FileSendCommand extends Command<void> {
  async execute(local: string, remote: string) {
    const cwd = process.cwd()
    this.send(`file send remote -cw "${cwd}" ${local} ${remote}`)
    await this.connection.readAll()
  }
}
