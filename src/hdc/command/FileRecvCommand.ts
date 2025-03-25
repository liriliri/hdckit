import ExecCommand from '../ExecCommand'
import path from 'path'
import contain from 'licia/contain'

export default class FileRecvCommand extends ExecCommand<void> {
  async execute(remote: string, local: string) {
    const { stdout } = await this.run([
      'file',
      'recv',
      remote,
      path.resolve(local),
    ])
    if (!contain(stdout, 'finish')) {
      throw new Error('Recv file failed')
    }
  }
}
