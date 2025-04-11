import Command from '../Command'
import contain from 'licia/contain'
import { readPorts } from '../util'

export interface IForward {
  local: string
  remote: string
  target: string
}

export class ForwardPortCommand extends Command<void> {
  async execute(local: string, remote: string) {
    this.send(`fport ${local} ${remote}`)
    return this.connection.readValue().then((data) => {
      const result = data.toString()
      if (!contain(result, 'OK')) {
        throw new Error(result)
      }
    })
  }
}

export class ListForwardsCommand extends Command<IForward[]> {
  async execute() {
    this.send('fport ls')
    return this.connection.readValue().then((data) => {
      const result = data.toString()
      return readPorts(result)
    })
  }
}

export class RemoveForwardPortCommand extends Command<void> {
  async execute(local: string, remote: string) {
    this.send(`fport rm ${local} ${remote}`)
    return this.connection.readValue().then((data) => {
      const result = data.toString()
      if (!contain(result, 'success')) {
        throw new Error(result)
      }
    })
  }
}
