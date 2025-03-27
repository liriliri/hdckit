import ExecCommand from '../ExecCommand'
import contain from 'licia/contain'

export default class UninstallCommand extends ExecCommand<void> {
  async execute(bundleName: string) {
    const { stdout } = await this.run(['uninstall', bundleName])
    if (!contain(stdout, 'uninstall bundle successfully')) {
      throw new Error('Uninstall package failed')
    }
  }
}
