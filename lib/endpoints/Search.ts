import * as utils from '../utils'

export const search = (cookie: string, args: any) => async (
  query: string,
  filter?: string
) => {
  const body: any = utils.generateBody({ userID: args.userID })
  if (filter) {
    let param: string
    switch (filter) {
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
  const contents = response.contents.sectionListRenderer.contents
  let results: any = []
  contents.map((ctx: any) => {
    if (ctx.itemSectionRenderer) return
    ctx = ctx.musicShelfRenderer
    ctx.contents.map((e: any) => {
      e = e.musicResponsiveListItemRenderer
      let type: string
      if (filter) type = filter.slice(0, filter.length - 1)
      else
        type = ctx.title.runs[0].text
          .toLowerCase()
          .slice(0, ctx.title.runs[0].text.length)
      if (type === 'top result') {
        type = e.flexColumns[1].musicResponsiveListItemFlexColumnRenderer.text.runs[0].text.toLowerCase()
      }
      if (!['playlist', 'song', 'video', 'artist'].includes(type))
        type = 'album'
      if (!filter) e.flexColumns.splice(1, 1)
      let result: any = {
        type,
        title:
          e.flexColumns[0].musicResponsiveListItemFlexColumnRenderer.text
            .runs[0]
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
          result.tracks = parseInt(
            e.flexColumns[2].musicResponsiveListItemFlexColumnRenderer.text
              .runs[0].text
          )
          result.id = e.doubleTapCommand.watchPlaylistEndpoint.playlistId
        }
        if (type === 'album') {
        }
      } else {
      }
      results.push(result)
    })
  })
  return results
}
