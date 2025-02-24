import { TcpNetConnectOpts } from 'net'

export interface ClientOptions extends TcpNetConnectOpts {}

export type Parameters = Record<string, string>
