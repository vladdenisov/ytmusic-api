import { Song } from '../../models/Song'
import * as utils from '../utils'

export const Player = async (
  cookie: string,
  args: any,
  videoId: string,
): Promise<Song> => {
  const body: any = utils.generateBody({ userID: args.userID })
  body.videoId = videoId
  const response = await utils.sendRequest(cookie, {
    endpoint: 'next',
    userID: args.userID,
    authUser: args.authUser,
    body
  })
  if (response.error) throw new Error(response.error.status)
  const content = response.contents.singleColumnMusicWatchNextResultsRenderer.tabbedRenderer.watchNextTabbedResultsRenderer.tabs[0].tabRenderer.content.musicQueueRenderer.content.playlistPanelRenderer.contents[0].playlistPanelVideoRenderer
  return {
    title: content.title.runs[0].text,
    duration: content.lengthText.runs[0].text,
    thumbnail: content.thumbnail.thumbnails,
    author: [content.longBylineText.runs[0]],
    album: content.longBylineText.runs[content.longBylineText.runs - 3],
    url: `https://music.youtube.com/watch?v=${content.navigationEndpoint.watchEndpoint.videoId}`,
    id: content.navigationEndpoint.watchEndpoint.videoId
  }
}
