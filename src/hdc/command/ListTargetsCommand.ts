import Command from '../Command'
import contain from 'licia/contain'

export default class ListTargetsCommand extends Command<string[]> {
  async execute() {
    this.send('list targets')
    return this.connection.readValue().then((data) => {
      const result = data.toString()
      if (contain(result, 'Empty')) {
        return []
      }

      return result.split('\n').filter((line) => line)
    })
  }
}
