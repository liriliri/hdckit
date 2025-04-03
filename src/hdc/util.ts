import os from 'node:os'
import path from 'node:path'
import fs from 'licia/fs'
import toNum from 'licia/toNum'

export async function getLastPid() {
  const p = path.resolve(os.tmpdir(), '.HDCServer.pid')

  if (await fs.exists(p)) {
    const data = await fs.readFile(p, 'utf8')
    return toNum(data)
  }

  return 0
}
