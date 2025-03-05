import Command from '../Command'
import Connection from '../Connection'

export default class ShellCommand extends Command<Connection> {
  async execute(command: string) {
    this.send(`shell ${command}`)

    return this.connection
  }
}
