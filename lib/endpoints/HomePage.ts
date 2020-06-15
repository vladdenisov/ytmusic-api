import HomePage from '../../models/HomePage'
import Carousel from '../../models/Carousel'
import CarouselItem from '../../models/CarouselItem'
import Subtitle from '../../models/Subtitle'
import * as utils from '../utils'

export const getHomePage = (cookie: string) => async (): Promise<HomePage> => {
  const response = await utils.sendRequest(cookie, 'FEmusic_home')
  const data =
    response.contents.singleColumnBrowseResultsRenderer.tabs[0].tabRenderer
  const contents = data.content.sectionListRenderer.contents
  let content: Carousel[] = []
  contents.map((carousel: any) => {
    const ctx = carousel.musicCarouselShelfRenderer
    let items: CarouselItem[] = []
    ctx.contents.map((e: any) => {
      e = e.musicTwoRowItemRenderer
      let temp: CarouselItem = {
        thumbnail: [],
        title: e.title,
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
      title: ctx.header.musicCarouselShelfBasicHeaderRenderer.title.runs.join(
        ' '
      ),
      content: items,
      strapline: ctx.header.musicCarouselShelfBasicHeaderRenderer.strapline
        ? ctx.header.musicCarouselShelfBasicHeaderRenderer.strapline.runs.join(
            ''
          )
        : undefined
    })
  })
  return {
    title: data.title,
    browseId: data.endpoint.browseEndpoint.browseId,
    content
  }
}
