import HomePage from '../../models/HomePage'
import Carousel from '../../models/Carousel'
import CarouselItem from '../../models/CarouselItem'
import Subtitle from '../../models/Subtitle'
import * as utils from '../utils'
import { createContinuation } from '../continuations'

const parseTwoRowItemRenderer = utils.parser((e: any) => {
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

const parseFlexColumnRenderer = utils.parser((item: any) => {
  return {
    thumbnail: [],
    title: item.text.runs[0].text,
    subtitle: [],
    navigationEndpoint: item.text.runs[0].navigationEndpoint
  } as CarouselItem
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
  const sectionListRenderer = data.content.sectionListRenderer

  const content: Carousel[] = parseCarouselContents(sectionListRenderer.contents)

  const home: HomePage = {
    title: data.title,
    browseId: data.endpoint.browseEndpoint.browseId,
    content
  }
  home.continue = createContinuation(
    cookie,
    args,
    parseCarouselContents,
    home,
    sectionListRenderer,
  )

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
    const t = await home.continue?.()
    if (!t || !t.content) break;

    home.content?.push(...t.content)
    if (!t.continue) break;

    home.continue = t.continue
  }
  return home;
}
