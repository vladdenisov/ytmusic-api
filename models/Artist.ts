import { Song } from './Song'
import Album from './Album'

export default interface Artist {
  name: string
  description?: string
  views?: string
  songs: {
    browseId?: string
    results: Song[]
  }
  albums: {
    browseId?: string
    results: Album[]
  }
  singles?: {
    browseId?: string
    results: Album[]
  }
}
