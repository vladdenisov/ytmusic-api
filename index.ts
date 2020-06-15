import { getHomePage } from './lib/endpoints/HomePage'

export class YTMUSIC {
  constructor(private cookie: string) {
    this.cookie = cookie
  }
  getHomePage = getHomePage(this.cookie)
}
