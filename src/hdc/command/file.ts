import ExecCommand from '../ExecCommand'
import path from 'path'
import contain from 'licia/contain'

export class FileRecvCommand extends ExecCommand<void> {
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

export class FileSendCommand extends ExecCommand<void> {
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
