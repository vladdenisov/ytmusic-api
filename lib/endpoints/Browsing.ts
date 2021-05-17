import * as utils from '../utils'
import Album from '../../models/Album'
import Artist from '../../models/Artist'
import { Song } from '../../models/Song'
export const getArtist = async (
  cookie: string,
  args: {
    userID?: string
    authUser?: number
  },
  channelId: string
): Promise<Artist | Error> => {
  const result = await utils.sendRequest(cookie, {
    id: channelId,
    type: 'ARTIST',
    endpoint: 'browse',
    userID: args.userID,
    authUser: args.authUser
  })
  if (result.error) throw new Error(result.error.status)

  const data =
    result.contents.singleColumnBrowseResultsRenderer.tabs[0].tabRenderer
      .content.sectionListRenderer.contents
  let songs: { browseId?: string; results: Song[] } = { results: [] }
  let albums: { browseId?: string; results: Album[] } = { results: [] }
  if (data[0].musicShelfRenderer.contents) {
    if (data[0].musicShelfRenderer.bottomEndpoint)
      songs.browseId =
        data[0].musicShelfRenderer.bottomEndpoint.browseEndpoint.browseId
    data[0].musicShelfRenderer.contents.map((e: any, i: number) => {
      e = e.musicResponsiveListItemRenderer
      songs.results.push({
        title:
          e.flexColumns[0].musicResponsiveListItemFlexColumnRenderer.text
            .runs[0],
        thumbnail: e.thumbnail.musicThumbnailRenderer.thumbnail.thumbnails,
        author:
          e.flexColumns[1].musicResponsiveListItemFlexColumnRenderer.text.runs,
        album:
          e.flexColumns[2].musicResponsiveListItemFlexColumnRenderer.text
            .runs[0],
        id: e.flexColumns[0].musicResponsiveListItemFlexColumnRenderer.text
          .runs[0].navigationEndpoint.watchEndpoint.videoId,
        url: `https://music.youtube.com/watch?v=${e.flexColumns[0].musicResponsiveListItemFlexColumnRenderer.text.runs[0].navigationEndpoint.watchEndpoint.videoId}`
      })
    })
  }
  if (data[1].musicCarouselShelfRenderer) {
    if (
      data[1].musicCarouselShelfRenderer.header
        .musicCarouselShelfBasicHeaderRenderer.title.runs[0].text === 'Albums'
    ) {
      if (
        data[1].musicCarouselShelfRenderer.header
          .musicCarouselShelfBasicHeaderRenderer.moreContentButton
      )
        albums.browseId =
          data[1].musicCarouselShelfRenderer.header.musicCarouselShelfBasicHeaderRenderer.moreContentButton
      data[1].musicCarouselShelfRenderer.contents.map((e: any, i: number) => {
        e = e.musicTwoRowItemRenderer
        albums.results.push({
          title: e.title.runs[0],
          thumbnail:
            e.thumbnailRenderer.musicThumbnailRenderer.thumbnail.thumbnails,
          year: e.subtitle.runs[2].text,
          author: e.subtitle.runs[0].text,
          browseId: e.navigationEndpoint.browseEndpoint.browseId,
          url: `https://music.youtube.com/playlist?list=${e.thumbnailOverlay.musicItemThumbnailOverlayRenderer.content.musicPlayButtonRenderer.playNavigationEndpoint.watchPlaylistEndpoint.playlistId}`
        })
      })
    }
  }
  let artist = {
    name: result.header.musicImmersiveHeaderRenderer.title.runs[0].text,
    description: result.header.musicImmersiveHeaderRenderer.description
      ? result.header.musicImmersiveHeaderRenderer.description.runs[0].text
      : '',
    songs,
    albums
  }
  return artist
}
