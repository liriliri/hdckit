import Emitter from 'licia/Emitter'
import Command from './Command'
import { readTargets } from './util'
import contain from 'licia/contain'

export default class Tracker extends Emitter {
  private targetList: string[] = []
  private ended = false
  constructor(private readonly command: Command<Tracker>) {
    super()

    this.read()

    const socket = this.command.connection.socket
    socket.on('end', () => {
      if (!this.ended) {
        this.ended = true
        this.emit('error', new Error('Connection closed'))
      }
    })
    socket.on('error', (err) => this.emit('error', err))
  }
  end() {
    this.ended = true
    this.command.connection.end()
  }
  private async read() {
    if (this.ended) {
      return
    }
    this.command.send('list targets')
    const data = await this.command.connection.readValue()
    const targets = readTargets(data.toString())
    this.update(targets)
    setTimeout(() => this.read(), 1000)
  }
  private update(newList: string[]) {
    for (let i = 0, len = newList.length; i < len; i++) {
      const target = newList[i]
      if (contain(this.targetList, target)) {
        continue
      } else {
        this.emit('add', target)
      }
    }
    for (let i = 0, len = this.targetList.length; i < len; i++) {
      const target = this.targetList[i]
      if (!contain(newList, target)) {
        this.emit('remove', target)
      }
    }
    this.targetList = newList
  }
}
