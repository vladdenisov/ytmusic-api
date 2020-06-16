import HomePage from '../../models/HomePage'
import Carousel from '../../models/Carousel'
import CarouselItem from '../../models/CarouselItem'
import Subtitle from '../../models/Subtitle'
import * as utils from '../utils'

export const getHomePage = (
  cookie: string,
  userID?: string
) => async (): Promise<HomePage> => {
  const response = await utils.sendRequest(cookie, {
    id: 'FEmusic_home',
    endpoint: 'browse',
    userID: userID
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
      userID
    )
  }
  return home
}

const getHomePageC = (
  cookie: string,
  cToken: string,
  itct: string,
  userID?: string
) => async (): Promise<HomePage> => {
  const body: any = utils.generateBody({ userID })
  const response = await utils.sendRequest(cookie, {
    endpoint: 'browse',
    body,
    cToken,
    itct
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
      userID
    )
  }

  return home
}

export const getFullHomePage = (
  cookie: string,
  userID?: string
) => async () => {
  const home = await getHomePage(cookie, userID)()
  while (true) {
    const t = await home.continue()
    home.content?.push(...t.content)
    if (!t.continue) return home
    home.continue = t.continue
  }
}
