import Playlist from '../../models/Playlist'
import * as utils from '../utils'
/**
 * Returns Playlist Info
 *
 * @usage
 *
 * ```js
 *  const api = new YTMUSIC(cookie)
 *  const data = await api.getPlaylist('RDAMVM5hFevwJ4JXI')
 * ```
 * @param id - playlist ID
 * @returns {@link Playlist}
 *
 */
export const getPlaylist = (cookie: string, userID?: string) => async (
  id: string
): Promise<Playlist> => {
  const response = await utils.sendRequest(cookie, {
    id: `VL${id}`,
    type: 'PLAYLIST',
    endpoint: 'browse'
  })
  const header = response.header.musicDetailHeaderRenderer
    ? response.header.musicDetailHeaderRenderer
    : response.header.musicEditablePlaylistDetailHeaderRenderer.header
        .musicDetailHeaderRenderer
  const data =
    response.contents.singleColumnBrowseResultsRenderer.tabs[0].tabRenderer
      .content.sectionListRenderer.contents[0].musicPlaylistShelfRenderer
  const playlist: Playlist = {
    title: header.title.runs[0],
    thumbnail:
      header.thumbnail.croppedSquareThumbnailRenderer.thumbnail.thumbnails,
    playlistId: id,
    content: [],
    subtitle: header.subtitle.runs,
    secondSubtitle: header.secondSubtitle.runs
  }
  data.contents.map((e: any) => {
    e = e.musicResponsiveListItemRenderer
    playlist.content.push({
      duration:
        e.fixedColumns[0].musicResponsiveListItemFixedColumnRenderer.text
          .runs[0].text,
      thumbnail: e.thumbnail.musicThumbnailRenderer.thumbnail.thumbnails,
      title:
        e.flexColumns[0].musicResponsiveListItemFlexColumnRenderer.text.runs[0],
      author:
        e.flexColumns[1].musicResponsiveListItemFlexColumnRenderer.text.runs,
      album:
        e.flexColumns[2].musicResponsiveListItemFlexColumnRenderer.text.runs[0],
      url: `https://music.youtube.com/watch?v=${e.flexColumns[0].musicResponsiveListItemFlexColumnRenderer.text.runs[0].navigationEndpoint.watchEndpoint.videoId}&list=${id}`
    })
  })
  return playlist
}
/**
 * Add song(s) to playlist
 *
 * @usage
 *
 * ```js
 *  const api = new YTMUSIC(cookie)
 *  const data = await api.addToPlaylist(['-mLpe7KUg9U', '5hFevwJ4JXI'], 'RDAMVM5hFevwJ4JXI')
 * ```
 * @param ids - Array of song ids to add
 * @param playlistId -  ID of playlist
 * @returns ```js
 * {
  status: string
  playlistName?: string
  ids: string[]
  playlistId: string
}
```
 */
export const addToPlaylist = (cookie: string, userID?: string) => async (
  ids: string[],
  playlistId: string
): Promise<{
  status: string
  playlistName?: string
  ids: string[]
  playlistId: string
}> => {
  const body: any = utils.generateBody({ userID: userID })
  body.playlistId = playlistId
  if (userID) body.context.user.onBehalfOfUser = userID
  body.actions = [{ action: 'ACTION_ADD_VIDEO', addedVideoId: 'Kr4EQDVETuA' }]
  const response = await utils.sendRequest(cookie, {
    body,
    endpoint: 'browse/edit_playlist'
  })
  console.log(response)
  return {
    status: response.status,
    playlistName:
      response.actions[0].openPopupAction.popup.notificationActionRenderer
        .responseText.runs[1].text,
    ids,
    playlistId
  }
}
