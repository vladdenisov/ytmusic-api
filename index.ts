import * as HomePage from './lib/endpoints/HomePage'
import * as Playlist from './lib/endpoints/Playlist'
import * as Browsing from './lib/endpoints/Browsing'
import * as Browse from './lib/endpoints/Browse'
import { search } from './lib/endpoints/Search'
export class YTMUSIC {
  userID?: string
  authUser: number | undefined
  constructor(
    private cookie: string,
    private args?: { userID: string; authUser?: number }
  ) {
    this.cookie = cookie
    if (args?.userID) {
      this.userID = args.userID
    }
    if (args?.authUser) {
      this.authUser = args.authUser
    }
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

  getPlaylists = async () => {
    return await Browse.getPlaylists(this.cookie, this)
  }

  getPlaylist = async (id: string, limit?: number) =>
    await Playlist.getPlaylist(this.cookie, this, id, limit)
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
  /**
 * Remove song(s) from playlist
 *
 * @usage
 *
 * ```js
 *  const api = new YTMUSIC(cookie)
 *  const data = await api.removeFromPlaylist(['-mLpe7KUg9U', '5hFevwJ4JXI'], 'RDAMVM5hFevwJ4JXI')
 * ```
 * @param ids - Array of song ids to remove
 * @param playlistId -  ID of playlist
```
 */
  removeFromPlaylist = async (
    ids: string[],
    playlistId: string,
    setVideoId?: string
  ) =>
    await Playlist.removeFromPlaylist(
      this.cookie,
      this,
      ids,
      playlistId,
      setVideoId
    )
  getArtist = async (channelId: string) =>
    Browsing.getArtist(this.cookie, this, channelId)
}
