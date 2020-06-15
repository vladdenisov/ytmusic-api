import Subtitle from './Subtitle'
import NavigationEndpoint from './NavigationEndpoint'
export default interface CarouselItem {
  readonly thumbnail: Array<{
    height: number
    width: number
    url: string
  }>
  readonly title: string
  readonly subtitle: Subtitle[]
  readonly navigationEndpoint: NavigationEndpoint
}
interface CarouselItemTitle {
  readonly text: string
  readonly navigationEndpoint: NavigationEndpoint
}
