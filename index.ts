import { getHomePage, getFullHomePage } from './lib/endpoints/HomePage'
import {
  getPlaylist,
  addToPlaylist,
  createPlaylist
} from './lib/endpoints/Playlist'
import { search } from './lib/endpoints/Search'
export class YTMUSIC {
  userID: string
  authUser: number | undefined
  constructor(
    private cookie: string,
    private args: { userID: string; authUser?: number }
  ) {
    this.cookie = cookie
    this.userID = args.userID
    this.authUser = args.authUser
  }
  getHomePage = getHomePage(this.cookie, this)
  getPlaylist = getPlaylist(this.cookie, this)
  addToPlaylist = addToPlaylist(this.cookie, this)
  getFullHomePage = getFullHomePage(this.cookie, this)
  search = search(this.cookie, this)
  createPlaylist = createPlaylist(this.cookie, this)
}
