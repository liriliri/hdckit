import Command from '../Command'
import { readTargets } from '../util'
import Tracker from '../Tracker'

export class ListTargetsCommand extends Command<string[]> {
  async execute() {
    this.send('list targets')
    return this.connection.readValue().then((data) => {
      return readTargets(data.toString())
    })
  }
}

export class TrackTargetsCommand extends Command<Tracker> {
  async execute() {
    this.send('alive')
    return new Tracker(this)
  }
}
