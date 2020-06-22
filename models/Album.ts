import Thumbnail from './Thumbnail'

export default interface Album {
  title: Text
  thumbnail: Thumbnail[]
  year: string
  browseId: string
  url: string
  author: string
}
