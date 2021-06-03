import Playlist from '../../models/Playlist'
import { Song } from '../../models/Song'
import { createContinuation } from '../continuations'
import * as utils from '../utils'

const parsePlaylist = utils.parser((response: any, playlistId: string) => {
  const header = response.header.musicDetailHeaderRenderer
    ? response.header.musicDetailHeaderRenderer
    : response.header.musicEditablePlaylistDetailHeaderRenderer.header
        .musicDetailHeaderRenderer
  const playlist: Playlist = {
    title: header.title.runs[0],
    thumbnail:
      header.thumbnail.croppedSquareThumbnailRenderer.thumbnail.thumbnails,
    playlistId,
    content: [],
    subtitle: header.subtitle.runs,
    secondSubtitle: header.secondSubtitle.runs
  }
  return playlist
})

const parseSong = utils.parser((e: any, playlistId: string) => {
  const primaryTextRun =
    e.flexColumns[0].musicResponsiveListItemFlexColumnRenderer.text.runs[0]
  const id = primaryTextRun?.navigationEndpoint?.watchEndpoint?.videoId
  if (!id) {
    // NOTE: It is apparently possible to have items that don't have an ID!
    // The Web UI renders them as disabled, and the only available action is to
    // remove them from the playlist. For now, we will wimply omit them from
    // results, since having an optional ID would be quite a breaking change
    return
  }

  return {
    id,
    duration:
      e.fixedColumns[0].musicResponsiveListItemFixedColumnRenderer.text.runs[0]
        .text,
    thumbnail: e.thumbnail.musicThumbnailRenderer.thumbnail.thumbnails,
    title: primaryTextRun,
    author:
      e.flexColumns[1].musicResponsiveListItemFlexColumnRenderer.text.runs,
    album:
      e.flexColumns[2].musicResponsiveListItemFlexColumnRenderer.text.runs?.[0],
    url: `https://music.youtube.com/watch?v=${id}&list=${playlistId}`
  } as Song
})

const parsePlaylistContents = utils.parser(
  (contents: any, playlistId: string, limit: number | undefined) => {
    const content: Song[] = []
    for (let i = 0; i < contents.length; ++i) {
      const e = contents[i].musicResponsiveListItemRenderer
      if (limit && i > limit - 1) break

      const song = parseSong(e, playlistId)
      if (song) {
        content.push(song)
      }
    }
    return content
  }
)

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
    id: id.startsWith('VL') ? id : `VL${id}`,
    type: 'PLAYLIST',
    endpoint: 'browse',
    authUser: args.authUser
  })
  const playlist = parsePlaylist(response, id)
  playlist.playlistId = id

  const data =
    response.contents.singleColumnBrowseResultsRenderer.tabs[0].tabRenderer
      .content.sectionListRenderer.contents[0].musicPlaylistShelfRenderer
  if (!data.contents) return playlist

  playlist.content = parsePlaylistContents(data.contents, id, limit)
  if (data.contents[0].playlistItemData) {
    playlist.setVideoId = data.contents[0].playlistItemData.playlistSetVideoId
  }

  const remainingLimit = limit ? limit - playlist.content.length : undefined
  if (remainingLimit == null || remainingLimit > 0) {
    playlist.continue = createContinuation(
      cookie,
      args,
      (contents) => parsePlaylistContents(contents, id, remainingLimit),
      playlist,
      data
    )
  }

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
    playlistName: response.actions[0].openPopupAction
      ? response.actions[0].openPopupAction.popup.notificationActionRenderer
          .responseText.runs[1].text
      : response.actions[0].addToToastAction.item.notificationActionRenderer
          .responseText.runs[0].text,
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
