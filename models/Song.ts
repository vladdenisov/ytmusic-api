import Thumbnail from './Thumbnail'
import NavigationEndpoint from './NavigationEndpoint'

export interface Song {
  readonly title: Text
  readonly duration: string
  readonly thumbnail: Thumbnail[]
  readonly author: Text[]
  readonly album: Text
  readonly url: string
  readonly id: string
}
interface Text {
  text: string
  navigationEndpoint?: NavigationEndpoint
}
