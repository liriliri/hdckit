import path from 'path'
import trim from 'licia/trim'
import contain from 'licia/contain'
import Target from './Target'
import cmpVersion from 'licia/cmpVersion'
import toNum from 'licia/toNum'
import getPort from 'licia/getPort'

const SDK_PATH = path.join(
  __dirname,
  '../../uitestkit_sdk/uitest_agent_v1.1.0.so'
)
const SDK_VERSION = '1.1.0'
const AGENT_PATH = '/data/local/tmp/agent.so'

export default class UiDriver {
  private readonly target: Target
  constructor(target: Target) {
    this.target = target
  }
  async start(sdkPath = SDK_PATH, sdkVersion = SDK_VERSION) {
    let uiTestPid = trim(await this.shell('pidof uitest'))
    const shouldUpdateSdk = await this.shouldUpdateSdk(sdkVersion)
    if (!uiTestPid || shouldUpdateSdk) {
      if (shouldUpdateSdk) {
        if (uiTestPid) {
          await this.shell(`kill -9 ${uiTestPid}`)
          uiTestPid = ''
        }
        await this.updateSdk(sdkPath)
      }

      if (!uiTestPid) {
        await this.shell('uitest start-daemon singleness')
      }
    }

    const port = await this.forwardTcp(8012)
    console.log(port)
  }
  private async forwardTcp(p: number) {
    const { target } = this
    const remote = `tcp:${p}`
    const forwards = await target.listForwards()

    for (let i = 0, len = forwards.length; i < len; i++) {
      const forward = forwards[i]
      if (forward.remote === remote) {
        return toNum(forward.local.replace('tcp:', ''))
      }
    }

    const port = await getPort()
    const local = `tcp:${port}`
    await target.forward(local, remote)

    return port
  }
  private async shouldUpdateSdk(sdkVersion: string) {
    const result = await this.shell(
      `cat ${AGENT_PATH} | grep -a UITEST_AGENT_LIBRARY`
    )
    if (!contain(result, 'UITEST_AGENT_LIBRARY')) {
      return true
    }
    const deviceSdkVersion = getSdkVersion(result)
    return cmpVersion(deviceSdkVersion, sdkVersion) < 0
  }
  private async updateSdk(sdkPath: string) {
    await this.shell(`rm ${AGENT_PATH}`)
    await this.target.sendFile(sdkPath, AGENT_PATH)
  }
  private async shell(command: string) {
    const connection = await this.target.shell(command)
    return (await connection.readAll()).toString()
  }
}

function getSdkVersion(raw: string) {
  return trim(raw.slice(raw.indexOf('@v') + 2))
}
