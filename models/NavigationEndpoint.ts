export default interface NavigationEndpoint {
    browseEndpoint?: {
        browseId: string, 
        pageType: string
    },
    watchEndpoint?: {
        params?: string, 
        playlistId?: string,
        videoId: string
    },
    watchPlaylistEndpoint?: {
        playlistId: string,
        params: string
    },
    clickTrackingParams: string
}