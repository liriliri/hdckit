import Command from '../Command'
import { readTargets } from '../util'

export default class ListTargetsCommand extends Command<string[]> {
  async execute() {
    this.send('list targets')
    return this.connection.readValue().then((data) => {
      return readTargets(data.toString())
    })
  }
}
