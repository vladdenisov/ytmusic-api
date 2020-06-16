import CarouselItem from './CarouselItem'
import NavigationEndpoint from './NavigationEndpoint'
export default interface Carousel {
  readonly title: string
  readonly strapline?: { text: string; navigationEndpoint?: NavigationEndpoint }
  readonly content: Array<CarouselItem>
}
