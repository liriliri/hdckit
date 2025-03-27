import ExecCommand from '../ExecCommand'
import path from 'path'
import contain from 'licia/contain'

export default class InstallCommand extends ExecCommand<void> {
  async execute(hap: string) {
    const { stdout } = await this.run(['install', path.resolve(hap)])
    if (!contain(stdout, 'install bundle successfully')) {
      throw new Error('Install package failed')
    }
  }
}
