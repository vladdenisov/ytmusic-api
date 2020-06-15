import Subtitle from './Subtitle'
import Thumbnail from './Thumbnail'
import { Song } from './Song'

export default interface Playlist {
  title: string
  thumbnail: Thumbnail[]
  subtitle?: Subtitle[]
  secondSubtitle?: Subtitle[]
  playlistId: string
  content: Song[]
}
