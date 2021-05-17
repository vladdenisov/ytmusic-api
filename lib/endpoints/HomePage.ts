import HomePage from '../../models/HomePage'
import Carousel from '../../models/Carousel'
import CarouselItem from '../../models/CarouselItem'
import Subtitle from '../../models/Subtitle'
import * as utils from '../utils'

const parseTwoRowItemRenderer = utils.parser<any, CarouselItem>((e: any) => {
  const item: CarouselItem = {
    thumbnail: [],
    title: e.title.runs[0],
    subtitle: [],
    navigationEndpoint: e.navigationEndpoint
  }
  e.thumbnailRenderer.musicThumbnailRenderer.thumbnail.thumbnails.forEach(
    (el: any) => item.thumbnail.push(el)
  )
  e.subtitle.runs.forEach((el: any) => {
    let sub: Subtitle = {
      text: el.text
    }
    if (el.navigationEndpoint) {
      sub.navigationEndpoint = el.navigationEndpoint
    }
    item.subtitle.push(sub)
  })
  return item
})

const parseFlexColumnRenderer = utils.parser<any, CarouselItem>((item: any) => {
  return {
    thumbnail: [],
    title: item.text.runs[0].text,
    subtitle: [],
    navigationEndpoint: item.text.runs[0].navigationEndpoint
  }
})

function parseResponsiveListItemRenderer(e: any): CarouselItem[] | undefined {
  if (e.flexColumns) {
    return utils.filterMap(e.flexColumns, (item: any) => {
      if (item.musicResponsiveListItemFlexColumnRenderer) {
        return parseFlexColumnRenderer(
          item.musicResponsiveListItemFlexColumnRenderer
        )
      }

      throw new Error(`Unexpected flexColumn content: ${JSON.stringify(item)}`)
    })
  }

  throw new Error(`Unexpected responsive contents: ${JSON.stringify(e)}`)
}

function parseCarouselItems(e: any) {
  if (e.musicTwoRowItemRenderer) {
    return [parseTwoRowItemRenderer(e.musicTwoRowItemRenderer)]
  }

  if (e.musicResponsiveListItemRenderer) {
    return parseResponsiveListItemRenderer(e.musicResponsiveListItemRenderer)
  }

  throw new Error(`Unexpected carousel contents: ${JSON.stringify(e)}`)
}

const parseCarouselContents = (contents: any): Carousel[] =>
  utils.filterMap(contents, (carousel: any) => {
    if (carousel.musicTastebuilderShelfRenderer) return
    const ctx = carousel.musicCarouselShelfRenderer
      ? carousel.musicCarouselShelfRenderer
      : carousel.musicImmersiveCarouselShelfRenderer
    const content: CarouselItem[] = utils.filterFlatMap(
      ctx.contents,
      parseCarouselItems
    )
    return {
      title:
        ctx.header.musicCarouselShelfBasicHeaderRenderer.title.runs[0].text,
      content,
      strapline: ctx.header.musicCarouselShelfBasicHeaderRenderer.strapline
        ? ctx.header.musicCarouselShelfBasicHeaderRenderer.strapline.runs
        : undefined
    }
  })

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
export const getHomePage = async (
  cookie: string,
  args: {
    userID?: string
    authUser?: number
  }
): Promise<HomePage> => {
  const response = await utils.sendRequest(cookie, {
    id: 'FEmusic_home',
    endpoint: 'browse',
    userID: args.userID,
    authUser: args.authUser
  })

  const data =
    response.contents.singleColumnBrowseResultsRenderer.tabs[0].tabRenderer
  const contents = data.content.sectionListRenderer.contents

  const content: Carousel[] = parseCarouselContents(contents)

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
const getHomePageC =
  (
    cookie: string,
    cToken: string,
    itct: string,
    args: {
      userID?: string
      authUser?: number
    }
  ) =>
  async (): Promise<HomePage> => {
    const body: any = utils.generateBody({ userID: args.userID })
    const response = await utils.sendRequest(cookie, {
      endpoint: 'browse',
      body,
      cToken,
      itct,
      authUser: args.authUser
    })
    const data = response.continuationContents.sectionListContinuation
    const content: Carousel[] = parseCarouselContents(data.contents)
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
export const getFullHomePage = async (
  cookie: string,
  args: {
    userID?: string
    authUser?: number
  }
) => {
  const home = await getHomePage(cookie, args)
  while (true) {
    const t = await home.continue()
    home.content?.push(...t.content)
    if (!t.continue) return home
    home.continue = t.continue
  }
}
