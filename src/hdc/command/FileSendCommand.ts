import ExecCommand from '../ExecCommand'
import path from 'path'
import contain from 'licia/contain'

export default class FileSendCommand extends ExecCommand<void> {
  async execute(local: string, remote: string) {
    const { stdout } = await this.run([
      'file',
      'send',
      path.resolve(local),
      remote,
    ])
    if (!contain(stdout, 'finish')) {
      throw new Error('Send file failed')
    }
  }
}
