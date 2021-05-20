import Carousel from './Carousel'

export default interface HomePage {
  title: string
  content?: Carousel[]
  browseId: string
  continue?: () => Promise<HomePage>
}
