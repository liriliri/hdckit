import os from 'node:os'
import path from 'node:path'
import fs from 'licia/fs'
import toNum from 'licia/toNum'
import contain from 'licia/contain'
import map from 'licia/map'

export async function getLastPid() {
  const p = path.resolve(os.tmpdir(), '.HDCServer.pid')

  if (await fs.exists(p)) {
    const data = await fs.readFile(p, 'utf8')
    return toNum(data)
  }

  return 0
}

export function readTargets(result: string) {
  if (contain(result, 'Empty')) {
    return []
  }

  return result.split('\n').filter((line) => line)
}

export function readPorts(result: string, reverse = false) {
  if (contain(result, 'Empty')) {
    return []
  }

  const lines = result.split('\n').filter((line) => {
    return line && contain(line, !reverse ? 'Forward' : 'Reverse')
  })

  return map(lines, (line) => {
    const parts = line.split(/\s+/)
    return {
      target: parts[0],
      local: parts[1],
      remote: parts[2],
    }
  })
}
