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
export const getPlaylist = async (
  cookie: string,
  args: {
    userID?: string
    authUser?: number
  },
  id: string,
  limit?: number
): Promise<Playlist> => {
  const response = await utils.sendRequest(cookie, {
    id: `VL${id}`,
    type: 'PLAYLIST',
    endpoint: 'browse',
    authUser: args.authUser
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
  if (!data.contents) return playlist
  data.contents.map((e: any, i: number) => {
    e = e.musicResponsiveListItemRenderer
    if (i === 0) {
      if (e.playlistItemData)
        playlist.setVideoId = e.playlistItemData.playlistSetVideoId
    }
    if (limit && i > limit - 1) return
    playlist.content.push({
      id:
        e.flexColumns[0].musicResponsiveListItemFlexColumnRenderer.text.runs[0]
          .navigationEndpoint.watchEndpoint.videoId,
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
export const addToPlaylist = async (
  cookie: string,
  args: {
    userID?: string
    authUser?: number
  },
  ids: string[],
  playlistId: string
): Promise<{
  status: string
  playlistName?: string
  ids: string[]
  playlistId: string
}> => {
  if (!playlistId) throw new Error('You must specify playlist id')
  const body: any = utils.generateBody({ userID: args.userID })
  body.playlistId = playlistId
  if (args.userID) body.context.user.onBehalfOfUser = args.userID
  body.actions = []
  for (let id of ids) {
    body.actions.push({ action: 'ACTION_ADD_VIDEO', addedVideoId: id })
  }
  const response = await utils.sendRequest(cookie, {
    body,
    authUser: args.authUser,
    endpoint: 'browse/edit_playlist'
  })
  return {
    status: response.status,
    playlistName:
      response.actions[0].openPopupAction.popup.notificationActionRenderer
        .responseText.runs[1].text,
    ids,
    playlistId
  }
}
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
 */
export const createPlaylist = async (
  cookie: string,
  args: {
    userID?: string
    authUser?: number
  },
  title: string,
  privacyStatus: 'PRIVATE' | 'PUBLIC' | 'UNLISTED',
  description?: string
): Promise<{ id: string } | Error> => {
  if (!description) description = ''
  if (!['PRIVATE', 'PUBLIC', 'UNLISTED'].includes(privacyStatus))
    throw new Error('Unknown privacyStatus')
  if (!title) throw new Error('Title cannot be empty')

  const body: any = utils.generateBody({
    userID: args.userID
  })
  body.title = title
  body.description = description
  body.privacyStatus = privacyStatus
  const response = await utils.sendRequest(cookie, {
    body,
    authUser: args.authUser,
    endpoint: 'playlist/create'
  })
  if (response.error) throw new Error(response.error.status)
  return {
    id: response.playlistId
  }
}
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
export const deletePlaylist = async (
  cookie: string,
  args: {
    userID?: string
    authUser?: number
  },
  id: string
): Promise<{ id: string } | Error> => {
  if (!id) throw new Error('You must specify playlist id')
  const body: any = utils.generateBody({
    userID: args.userID
  })
  body.playlistId = id
  const response = await utils.sendRequest(cookie, {
    body,
    authUser: args.authUser,
    endpoint: 'playlist/delete'
  })
  if (response.error) throw new Error(response.error.status)
  return {
    id
  }
}

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
export const removeFromPlaylist = async (
  cookie: string,
  args: {
    userID?: string
    authUser?: number
  },
  ids: string[],
  playlistId: string,
  setVideoId?: string
): Promise<
  | {
      status: string
      playlistName?: string
      ids: string[]
      playlistId: string
    }
  | Error
> => {
  if (!playlistId) {
    throw new Error('You must specify playlist id')
  }
  if (!setVideoId) {
    const pl = await getPlaylist(cookie, args, playlistId, 1)
    if (!pl.setVideoId) throw new Error("You don't own this playlist")
    setVideoId = pl.setVideoId
  }
  const body: any = utils.generateBody({ userID: args.userID })
  body.playlistId = playlistId
  if (args.userID) body.context.user.onBehalfOfUser = args.userID
  body.actions = []
  for (let id of ids) {
    body.actions.push({
      action: 'ACTION_REMOVE_VIDEO',
      removedVideoId: id,
      setVideoId: setVideoId
    })
  }
  const response = await utils.sendRequest(cookie, {
    body,
    authUser: args.authUser,
    endpoint: 'browse/edit_playlist'
  })
  return {
    status: response.status,
    playlistName:
      response.actions[0].openPopupAction.popup.notificationActionRenderer
        .responseText.runs[1].text,
    ids,
    playlistId
  }
}
