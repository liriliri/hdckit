import { ClientOptions } from '../ClientOptions'

export default class Client {
  constructor(
    { host = '127.0.0.1', port = 5037 }: ClientOptions = { port: 5037 }
  ) {}
  listTargets() {}
}
