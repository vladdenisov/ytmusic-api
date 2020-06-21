import * as utils from '../utils'
import Thumbnail from '../../models/Thumbnail'
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
export const search = async (
  cookie: string,
  args: any,
  query: string,
  options: {
    filter?: string
    max?: number
  }
): Promise<
  | Array<{
      type: 'song' | 'album' | 'playlist' | 'video' | 'artist'
      title: Text
      url: string
      tracksCount?: number
      thumbnails: Thumbnail[]
      author?: Text
      id?: string
      album?: Text
      [propName: string]: any
    }>
  | Error
> => {
  const body: any = utils.generateBody({ userID: args.userID })
  if (options.filter) {
    let param: string
    switch (options.filter) {
      case 'songs':
        param = 'RAAGAAgACgA'
      case 'videos':
        param = 'BABGAAgACgA'
      case 'albums':
        param = 'BAAGAEgACgA'
      case 'artists':
        param = 'BAAGAAgASgA'
      case 'playlists':
        param = 'BAAGAAgACgB'
      default:
        param = 'RAAGAAgACgA'
    }
    body.params = `Eg-KAQwIA${param}'MABqChAEEAMQCRAFEAo%3D'`
  }
  body.query = query
  const response = await utils.sendRequest(cookie, {
    endpoint: 'search',
    userID: args.userID,
    authUser: args.authUser,
    body
  })
  if (response.error) throw new Error(response.error.status)
  const contents = response.contents.sectionListRenderer.contents
  let results: any = []
  if (contents[0].messageRenderer) return []
  contents.map((ctx: any) => {
    if (ctx.itemSectionRenderer) return
    ctx = ctx.musicShelfRenderer
    ctx.contents.map((e: any, i: number) => {
      if (options.max && i > options.max - 1) return
      try {
        e = e.musicResponsiveListItemRenderer
        let type: string
        if (options.filter)
          type = options.filter.slice(0, options.filter.length - 1)
        else
          type = ctx.title.runs[0].text
            .toLowerCase()
            .slice(0, ctx.title.runs[0].text.length - 1)
        if (type === 'top resul') {
          type = e.flexColumns[1].musicResponsiveListItemFlexColumnRenderer.text.runs[0].text.toLowerCase()
        }
        if (!['playlist', 'song', 'video', 'artist'].includes(type))
          type = 'album'
        if (!options.filter) e.flexColumns.splice(1, 1)
        let result: any = {
          type,
          title:
            e.flexColumns[0].musicResponsiveListItemFlexColumnRenderer.text
              .runs[0],
          thumbnails: e.thumbnail.musicThumbnailRenderer.thumbnail.thumbnails
        }
        type = type.toLowerCase()
        if (['playlist', 'song', 'video', 'album'].includes(type)) {
          result.author =
            e.flexColumns[1].musicResponsiveListItemFlexColumnRenderer.text.runs[0]
          if (type === 'song') {
            result.url = `https://music.youtube.com/watch?v=${e.doubleTapCommand.watchEndpoint.videoId}&list=${e.doubleTapCommand.watchEndpoint.playlistId}`
            result.album =
              e.flexColumns[2].musicResponsiveListItemFlexColumnRenderer.text.runs[0]
            result.duration =
              e.flexColumns[3].musicResponsiveListItemFlexColumnRenderer.text.runs[0].text
            result.id = e.doubleTapCommand.watchEndpoint.videoId
          }
          if (type === 'video') {
            result.url = `https://music.youtube.com/watch?v=${e.doubleTapCommand.watchEndpoint.videoId}&list=${e.doubleTapCommand.watchEndpoint.playlistId}`
            result.views =
              e.flexColumns[2].musicResponsiveListItemFlexColumnRenderer.text.runs[0]
            result.id = e.doubleTapCommand.watchEndpoint.videoId
          }
          if (type === 'playlist') {
            result.url = `https://music.youtube.com/playlist?list=${e.doubleTapCommand.watchPlaylistEndpoint.playlistId}`
            result.tracksCount = parseInt(
              e.flexColumns[2].musicResponsiveListItemFlexColumnRenderer.text
                .runs[0].text
            )
            result.id = e.doubleTapCommand.watchPlaylistEndpoint.playlistId
          }
          if (type === 'album') {
            result.url = `https://music.youtube.com/browse/${e.navigationEndpoint.browseEndpoint.browseId}`
            result.playlistId =
              e.doubleTapCommand.watchPlaylistEndpoint.playlistId
            result.year =
              e.flexColumns[2].musicResponsiveListItemFlexColumnRenderer.text.runs[0].text
          }
        } else {
          result.subs =
            e.flexColumns[1].musicResponsiveListItemFlexColumnRenderer.text.runs[0].text
          result.url = `https://music.youtube.com/browse/${e.navigationEndpoint.browseEndpoint.browseId}`
        }
        results.push(result)
      } catch (e) {
        return
      }
    })
  })
  return results
}
