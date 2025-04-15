import Client from './Client'
import GetParametersCommand from './command/GetParametersCommand'
import contain from 'licia/contain'
import waitUntil from 'licia/waitUntil'
import ShellCommand from './command/ShellCommand'
import singleton from 'licia/singleton'
import filter from 'licia/filter'
import { FileSendCommand, FileRecvCommand } from './command/file'
import { InstallCommand, UninstallCommand } from './command/install'
import { ForwardPortCommand, RemoveForwardPortCommand } from './command/forward'
import { ReversePortCommand } from './command/reverse'
import UiDriver from './UiDriver'

export default class Target {
  readonly client: Client
  readonly connectKey: string
  private ready = false
  constructor(client: Client, connectKey: string) {
    this.client = client
    this.connectKey = connectKey
  }
  async transport() {
    if (!this.ready) {
      await waitUntil(this.checkReady, 10000, 1000)
    }

    return this.client.connection(this.connectKey)
  }
  getParameters() {
    return this.transport().then((transport) =>
      new GetParametersCommand(transport).execute()
    )
  }
  shell(command: string) {
    return this.transport().then((transport) =>
      new ShellCommand(transport).execute(command)
    )
  }
  sendFile(local: string, remote: string) {
    return new FileSendCommand(
      this.connectKey,
      this.client.options.bin
    ).execute(local, remote)
  }
  recvFile(remote: string, local: string) {
    return new FileRecvCommand(
      this.connectKey,
      this.client.options.bin
    ).execute(remote, local)
  }
  install(hap: string) {
    return new InstallCommand(this.connectKey, this.client.options.bin).execute(
      hap
    )
  }
  uninstall(bundleName: string) {
    return new UninstallCommand(
      this.connectKey,
      this.client.options.bin
    ).execute(bundleName)
  }
  forward(local: string, remote: string) {
    return this.transport().then((transport) =>
      new ForwardPortCommand(transport).execute(local, remote)
    )
  }
  async listForwards() {
    const forwards = await this.client.listForwards()
    return filter(forwards, (forward) => forward.target === this.connectKey)
  }
  removeForward(local: string, remote: string) {
    return this.transport().then((transport) =>
      new RemoveForwardPortCommand(transport).execute(local, remote)
    )
  }
  reverse(remote: string, local: string) {
    return this.transport().then((transport) =>
      new ReversePortCommand(transport).execute(remote, local)
    )
  }
  async listReverses() {
    const reverses = await this.client.listReverses()
    return filter(reverses, (reverse) => reverse.target === this.connectKey)
  }
  removeReverse(remote: string, local: string) {
    return this.transport().then((transport) =>
      new RemoveForwardPortCommand(transport).execute(remote, local)
    )
  }
  async createUiDriver(sdkPath: string, sdkVersion: string) {
    return new UiDriver(this, sdkPath, sdkVersion)
  }
  private checkReady = singleton(async () => {
    const transport = await this.client.connection(this.connectKey)
    transport.send(Buffer.from('shell echo ready\n'))
    const data = await transport.readAll()
    if (!contain(data.toString(), 'E000004')) {
      this.ready = true
      return true
    }

    return false
  })
}
