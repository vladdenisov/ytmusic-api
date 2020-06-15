import CarouselItem from './CarouselItem';
export default interface Carousel {
    readonly title: string
    readonly strapline?: string
    readonly content: Array<CarouselItem>
}