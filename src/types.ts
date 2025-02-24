import { TcpNetConnectOpts } from 'net'

export interface ClientOptions extends TcpNetConnectOpts {
  bin?: string
}

export type Parameters = Record<string, string>
