import Command from '../Command'
import Hilog from '../Hilog'

export class HilogCommand extends Command<Hilog> {
  async execute() {
    this.send('shell hilog -v wrap -v epoch')
    return new Hilog(this)
  }
}
