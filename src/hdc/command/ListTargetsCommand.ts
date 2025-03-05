import Command from '../Command'

export default class ListTargetsCommand extends Command<string[]> {
  async execute() {
    this.send('list targets')
    return this.connection.readValue().then((data) => {
      return data
        .toString()
        .split('\n')
        .filter((line) => line)
    })
  }
}
