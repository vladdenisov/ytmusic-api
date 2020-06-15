import fetch from 'node-fetch'
import * as utils from './lib/utils'
import * as cookie from './cookie.json'
import HomePage from './models/HomePage'
import Carousel from './models/Carousel'
import CarouselItem from './models/CarouselItem'
import Subtitle from './models/Subtitle'
const sendRequest = async (id: string, type?: string) => {
  const headers: object = utils.generateHeaders(cookie.cookie)
  const options: object = {
    method: 'POST',
    headers: headers,
    body: utils.generateBody(id, type)
  }
  return fetch('https://music.youtube.com/youtubei/v1/browse?alt=json&key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30', options).then(data => data.json())
}

const getHomePage = async (): Promise<HomePage> => {
  const response = await sendRequest('FEmusic_home')
  const data = response.contents.singleColumnBrowseResultsRenderer.tabs[0].tabRenderer
  const contents = data.content.sectionListRenderer.contents
  let content:Carousel[] = []
  contents.map((carousel: any) => {
    const ctx = carousel.musicCarouselShelfRenderer
    let items:CarouselItem[] = []
    ctx.contents.map((e: any) => {
      e = e.musicTwoRowItemRenderer
      let temp:CarouselItem  = {
        thumbnail: [],
        title: e.title,
        subtitle: [],
        navigationEndpoint: e.navigationEndpoint
      }
      e.thumbnailRenderer.musicThumbnailRenderer.thumbnail.thumbnails.map((el: any) => temp.thumbnail.push(el))
      e.subtitle.runs.map((el: any) => {
        let sub:Subtitle = {
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
      title: ctx.header.musicCarouselShelfBasicHeaderRenderer.title.runs.join(" "),
      content: items,
      strapline: ctx.header.musicCarouselShelfBasicHeaderRenderer.strapline ? carousel.header.musicCarouselShelfBasicHeaderRenderer.strapline.runs.join('') : undefined
    })
  });
  return {
    title: data.title,
    browseId: data.endpoint.browseEndpoint.browseId,
    content
  }
}