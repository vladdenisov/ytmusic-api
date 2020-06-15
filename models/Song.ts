import Thumbnail from './Thumbnail'
import NavigationEndpoint from './NavigationEndpoint'

export interface Song {
  readonly title: Text
  readonly duration: string
  readonly thumbnail: Thumbnail[]
  readonly author: Text[]
  readonly album: Text
  readonly url: string
}
interface Text {
  text: string
  navigationEndpoint?: NavigationEndpoint
}
