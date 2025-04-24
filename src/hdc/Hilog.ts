import Command from './Command'
import Emitter from 'licia/Emitter'
import each from 'licia/each'
import toNum from 'licia/toNum'
import idxOf from 'licia/idxOf'
import trim from 'licia/trim'

export default class Hilog extends Emitter {
  private ended = false
  private data = ''
  constructor(private readonly command: Command<Hilog>) {
    super()

    this.read()
  }
  end() {
    this.ended = true
    this.command.connection.end()
  }
  private async read() {
    if (this.ended) {
      return
    }
    const buf = await this.command.connection.readValue()
    this.parse(buf)
    this.read()
  }
  private parse(buf: Buffer) {
    let { data } = this
    data += buf.toString()

    const rawEntries = []
    regEntryStart.lastIndex = 0
    let match = regEntryStart.exec(data)
    let nextMatch = regEntryStart.exec(data)
    while (match && nextMatch) {
      rawEntries.push(data.substring(match.index, nextMatch.index))
      match = nextMatch
      nextMatch = regEntryStart.exec(data)
    }

    each(rawEntries, (rawEntry) => {
      const entry = this.parseEntry(rawEntry)
      if (entry) {
        this.emit('entry', this.parseEntry(rawEntry))
      }
    })

    this.data = match ? data.substring(match.index) : ''
  }
  private parseEntry(rawEntry: string) {
    const entry = new Entry()
    const match = rawEntry.match(regEntry)
    if (match) {
      entry.date = new Date(toNum(match[1]) * 1000)
      entry.pid = toNum(match[2])
      entry.tid = toNum(match[3])
      entry.level = toLevel(match[4])
      entry.type = toType(match[5])
      entry.domain = match[6]
      entry.tag = match[7]
      entry.message = trim(match[8])
      return entry
    }
  }
}

class Entry {
  date: Date = null
  pid = -1
  tid = -1
  level: number = -1
  type: number = -1
  domain = ''
  tag = ''
  message = ''
}

function toLevel(letter: string) {
  return idxOf(['?', '?', 'V', 'D', 'I', 'W', 'E', 'F'], letter)
}

function toType(typePrefix: string) {
  return idxOf(['A', 'I', 'C', 'K', 'P'], typePrefix)
}

const regEntryStart = /\d{10}\.\d{3}\s+\d+\s+\d+/g
const regEntry =
  /^(\d{10}\.\d{3})\s+(\d+)\s+(\d+)\s+([DIWEF])\s+([AICKP])(.{5})\/([^:]*):(.*)/
