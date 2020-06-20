import * as HomePage from './lib/endpoints/HomePage'
import * as Playlist from './lib/endpoints/Playlist'
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
  /**
   * Returns First Part of HomePage
   *
   * @usage
   *
   * ```js
   *  const api = new YTMUSIC(cookie)
   *  const data = await api.getHomePage()
   * ```
   *
   * You can call `data.continue()` to get next part
   * @returns {@link HomePage}
   *
   */
  getHomePage = async () => {
    return await HomePage.getHomePage(this.cookie, this)
  }
  getPlaylist = Playlist.getPlaylist(this.cookie, this)
  addToPlaylist = async (ids: string[], playlistId: string) =>
    await Playlist.addToPlaylist(this.cookie, this, ids, playlistId)
  /**
   * Returns Full HomePage
   *
   * @usage
   * ```js
   *  const api = new YTMUSIC(cookie)
   *  const data = await api.getFullHomePage()
   * ```
   * @returns {@link HomePage}
   *
   */
  getFullHomePage = async () => {
    return await HomePage.getFullHomePage(this.cookie, this)
  }
  /**
   * Search
   *
   * @usage
   *
   * ```js
   *  const api = new YTMUSIC(cookie)
   *  const data = await api.createPlaylist('Summer Songs', 'PUBLIC', 'Some songs for summer')
   *  const songs = await api.search('Hot stuff')
   *  await api.addToPlaylist([songs[0].id], playlist.id)
   * ```
   * @param query - Search query
   * @param filter - What type to search
   * @param max - maximum results (recommended 1-3, because next results might be unparsable) default: infinity
   *
   */
  search = async (
    query: string,
    options: {
      filter?: 'songs' | 'albums' | 'playlists' | 'videos' | 'artists'
      max?: number
    }
  ) => await search(this.cookie, this, query, options)
  /**
   * Create playlist
   *
   * @usage
   *
   * ```js
   *  const api = new YTMUSIC(cookie)
   *  const data = await api.createPlaylist('Summer Songs', 'PUBLIC', 'Some songs for summer')
   *  await api.addToPlaylist(['-mLpe7KUg9U', '5hFevwJ4JXI'], playlist.id)
   * ```
   * @param title - Title
   * @param privacyStatus - Privacy Status of playlist
   * @param description - Description of playlist
  ```
 */
  createPlaylist = async (
    title: string,
    privacyStatus: 'PRIVATE' | 'PUBLIC' | 'UNLISTED',
    description?: string
  ) =>
    await Playlist.createPlaylist(
      this.cookie,
      this,
      title,
      privacyStatus,
      description
    )
  /**
   * Delete playlist
   *
   * @usage
   *
   * ```js
   *  const api = new YTMUSIC(cookie)
   *  const data = await api.createPlaylist('Summer Songs', 'PUBLIC', 'Some songs for summer')
   *  await api.deletePlaylist(playlist.id)
   * ```
   * @param id - id of the playlist
   */
  deletePlaylist = async (id: string) =>
    await Playlist.deletePlaylist(this.cookie, this, id)
}
