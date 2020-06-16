import { getHomePage } from './lib/endpoints/HomePage'
import { getPlaylist, addToPlaylist } from './lib/endpoints/Playlist'
export class YTMUSIC {
  constructor(private cookie: string, private userID?: string) {
    this.cookie = cookie
    this.userID = userID
  }
  getHomePage = getHomePage(this.cookie, this.userID)
  getPlaylist = getPlaylist(this.cookie, this.userID)
  addToPlaylist = addToPlaylist(this.cookie, this.userID)
}
