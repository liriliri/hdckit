import ExecCommand from '../ExecCommand'
import path from 'path'
import contain from 'licia/contain'

export class InstallCommand extends ExecCommand<void> {
  async execute(hap: string) {
    const { stdout } = await this.run(['install', path.resolve(hap)])
    if (!contain(stdout, 'install bundle successfully')) {
      throw new Error(stdout)
    }
  }
}

export class UninstallCommand extends ExecCommand<void> {
  async execute(bundleName: string) {
    const { stdout } = await this.run(['uninstall', bundleName])
    if (!contain(stdout, 'uninstall bundle successfully')) {
      throw new Error('Uninstall bundle failed')
    }
  }
}
