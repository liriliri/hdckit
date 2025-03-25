import execa = require('execa')

export default abstract class ExecCommand<T> {
  private bin: string
  private connectKey: string
  constructor(connectKey: string, bin = 'hdc') {
    this.bin = bin
    this.connectKey = connectKey
  }
  abstract execute(...args: any[]): Promise<T>
  run(args: string[], options: execa.Options = {}) {
    args.unshift('-t', this.connectKey)
    return execa(this.bin, args, options)
  }
}
