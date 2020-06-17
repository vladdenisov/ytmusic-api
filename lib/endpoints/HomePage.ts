import HomePage from '../../models/HomePage'
import Carousel from '../../models/Carousel'
import CarouselItem from '../../models/CarouselItem'
import Subtitle from '../../models/Subtitle'
import * as utils from '../utils'

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
export const getHomePage = (
  cookie: string,
  args: {
    userID?: string
    authUser?: number
  }
) => async (): Promise<HomePage> => {
  const response = await utils.sendRequest(cookie, {
    id: 'FEmusic_home',
    endpoint: 'browse',
    userID: args.userID,
    authUser: args.authUser
  })
  const data =
    response.contents.singleColumnBrowseResultsRenderer.tabs[0].tabRenderer
  const contents = data.content.sectionListRenderer.contents
  let content: Carousel[] = []
  contents.map((carousel: any) => {
    if (carousel.musicTastebuilderShelfRenderer) return
    const ctx = carousel.musicCarouselShelfRenderer
      ? carousel.musicCarouselShelfRenderer
      : carousel.musicImmersiveCarouselShelfRenderer
    let items: CarouselItem[] = []
    ctx.contents.map((e: any) => {
      e = e.musicTwoRowItemRenderer
      let temp: CarouselItem = {
        thumbnail: [],
        title: e.title.runs[0],
        subtitle: [],
        navigationEndpoint: e.navigationEndpoint
      }
      e.thumbnailRenderer.musicThumbnailRenderer.thumbnail.thumbnails.map(
        (el: any) => temp.thumbnail.push(el)
      )
      e.subtitle.runs.map((el: any) => {
        let sub: Subtitle = {
          text: el.text
        }
        if (el.navigationEndpoint) {
          sub.navigationEndpoint = el.navigationEndpoint
        }
        temp.subtitle.push(sub)
      })

      items.push(temp)
    })
    content.push({
      title:
        ctx.header.musicCarouselShelfBasicHeaderRenderer.title.runs[0].text,
      content: items,
      strapline: ctx.header.musicCarouselShelfBasicHeaderRenderer.strapline
        ? ctx.header.musicCarouselShelfBasicHeaderRenderer.strapline.runs
        : undefined
    })
  })
  const home: HomePage = {
    title: data.title,
    browseId: data.endpoint.browseEndpoint.browseId,
    content
  }
  if (data.content.sectionListRenderer.continuations) {
    home.continue = getHomePageC(
      cookie,
      data.content.sectionListRenderer.continuations[0].nextContinuationData
        .continuation,
      data.content.sectionListRenderer.continuations[0].nextContinuationData
        .clickTrackingParams,
      args
    )
  }
  return home
}
/**
 * Returns Continue of HomePage
 *
 * @usage
 *
 * ```js
 *  const api = new YTMUSIC(cookie)
 *  const data = await api.getHomePage()
 * ```
 * @param cToken Continue token from prev. response
 * @param itct clickTrackingParams from prev. response
 * You can call `data.continue()` to get next part
 * @returns {@link HomePage}
 *
 */
const getHomePageC = (
  cookie: string,
  cToken: string,
  itct: string,
  args: {
    userID?: string
    authUser?: number
  }
) => async (): Promise<HomePage> => {
  const body: any = utils.generateBody({ userID: args.userID })
  const response = await utils.sendRequest(cookie, {
    endpoint: 'browse',
    body,
    cToken,
    itct,
    authUser: args.authUser
  })
  const data = response.continuationContents.sectionListContinuation
  const content: Carousel[] = []
  data.contents.map((carousel: any) => {
    if (carousel.musicTastebuilderShelfRenderer) return
    const ctx = carousel.musicCarouselShelfRenderer
      ? carousel.musicCarouselShelfRenderer
      : carousel.musicImmersiveCarouselShelfRenderer
    let items: CarouselItem[] = []
    ctx.contents.map((e: any) => {
      e = e.musicTwoRowItemRenderer
      let temp: CarouselItem = {
        thumbnail: [],
        title: e.title.runs[0],
        subtitle: [],
        navigationEndpoint: e.navigationEndpoint
      }
      e.thumbnailRenderer.musicThumbnailRenderer.thumbnail.thumbnails.map(
        (el: any) => temp.thumbnail.push(el)
      )
      e.subtitle.runs.map((el: any) => {
        let sub: Subtitle = {
          text: el.text
        }
        if (el.navigationEndpoint) {
          sub.navigationEndpoint = el.navigationEndpoint
        }
        temp.subtitle.push(sub)
      })

      items.push(temp)
    })
    content.push({
      title:
        ctx.header.musicCarouselShelfBasicHeaderRenderer.title.runs[0].text,
      content: items,
      strapline: ctx.header.musicCarouselShelfBasicHeaderRenderer.strapline
        ? ctx.header.musicCarouselShelfBasicHeaderRenderer.strapline.runs
        : undefined
    })
  })
  const home: HomePage = {
    title:
      response.contents.singleColumnBrowseResultsRenderer.tabs[0].tabRenderer
        .title,
    content,
    browseId:
      response.contents.singleColumnBrowseResultsRenderer.tabs[0].tabRenderer
        .tabIdentifier
  }
  if (data.continuations) {
    home.continue = getHomePageC(
      cookie,
      data.continuations[0].nextContinuationData.continuation,
      data.continuations[0].nextContinuationData.clickTrackingParams,
      args
    )
  }

  return home
}
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
export const getFullHomePage = (
  cookie: string,
  args: {
    userID?: string
    authUser?: number
  }
) => async () => {
  const home = await getHomePage(cookie, args)()
  while (true) {
    const t = await home.continue()
    home.content?.push(...t.content)
    if (!t.continue) return home
    home.continue = t.continue
  }
}
