import Connection from './Connection'

export default abstract class Command<T> {
  connection: Connection
  constructor(connection: Connection) {
    this.connection = connection
  }
  abstract execute(...args: any[]): Promise<T>
  send(command: string) {
    this.connection.send(Buffer.from(command))
  }
}
