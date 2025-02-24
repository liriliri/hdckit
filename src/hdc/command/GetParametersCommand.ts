import Command from '../Command'
import { Parameters } from '../../types'

const RE_KEYVAL = /^\s*([\s\S]*?) = ([\s\S]*?)\r?$/gm

export default class GetParametersCommand extends Command<Parameters> {
  async execute() {
    this.send('shell param get')
    return this.connection.readAll().then((data) => {
      const value = data.toString()
      const params: Parameters = {}
      let match
      while ((match = RE_KEYVAL.exec(value))) {
        params[match[1]] = match[2]
      }
      return params
    })
  }
}
