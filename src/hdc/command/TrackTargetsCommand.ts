import Command from '../Command'
import Tracker from '../Tracker'

export default class TrackTargetsCommand extends Command<Tracker> {
  async execute() {
    this.send('alive')
    return new Tracker(this)
  }
}
