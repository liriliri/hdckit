import Command from '../Command'
import contain from 'licia/contain'
import { readPorts } from '../util'
import { IForward } from './forward'

export class ReversePortCommand extends Command<void> {
  async execute(remote: string, local: string) {
    this.send(`rport ${remote} ${local}`)
    return this.connection.readValue().then((data) => {
      const result = data.toString()
      if (!contain(result, 'OK')) {
        throw new Error(result)
      }
    })
  }
}

export class ListReversesCommand extends Command<IForward[]> {
  async execute() {
    this.send('fport ls')
    return this.connection.readValue().then((data) => {
      const result = data.toString()
      return readPorts(result, true)
    })
  }
}
