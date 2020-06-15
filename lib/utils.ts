import cookie from 'cookie'
const sha1 = require('sha1')

const getSAPISID = (raw: string): string => {
    const parsed = cookie.parse(raw)
    return parsed['SAPISID']
}

const getAuthToken = (raw_cookie: string): string => {
    const date = new Date().getTime()
    return `SAPISIDHASH ${date}_${sha1(date + " " + getSAPISID(raw_cookie) + " " + 'https://music.youtube.com')}`
}

export const generateBody = (id: string, type?: string): string => {
    const context = {"client":{"clientName":"WEB_REMIX","clientVersion":"0.1","hl":"en","gl":"RU","experimentIds":[],"experimentsToken":"","browserName":"Edge Chromium","browserVersion":"84.0.522.15","osName":"Windows","osVersion":"10.0","utcOffsetMinutes":180,"locationInfo":{"locationPermissionAuthorizationStatus":"LOCATION_PERMISSION_AUTHORIZATION_STATUS_UNSUPPORTED"},"musicAppInfo":{"musicActivityMasterSwitch":"MUSIC_ACTIVITY_MASTER_SWITCH_INDETERMINATE","musicLocationMasterSwitch":"MUSIC_LOCATION_MASTER_SWITCH_INDETERMINATE","pwaInstallabilityStatus":"PWA_INSTALLABILITY_STATUS_UNKNOWN"}},"capabilities":{},"request":{"internalExperimentFlags":[{"key":"force_music_enable_outertube_playlist_detail_browse","value":"true"},{"key":"force_music_enable_outertube_tastebuilder_browse","value":"true"},{"key":"force_music_enable_outertube_album_detail_browse","value":"true"},{"key":"force_music_enable_outertube_music_queue","value":"true"},{"key":"force_music_enable_outertube_search_suggestions","value":"true"}],"sessionIndex":0},"user":{"onBehalfOfUser":"116734035933352489474","enableSafetyMode":false},"clickTracking":{"clickTrackingParams":"IhMI5aKttYiE6gIVhEGbCh0o9w8rMghleHRlcm5hbA=="},"activePlayers":{}}
    if (type) return JSON.stringify({
        context,
        'browseEndpointContextSupportedConfigs': {
            "browseEndpointContextMusicConfig": {
                "pageType": "MUSIC_PAGE_TYPE_" + type
            }
        },
        'browseId': id
    })
    else return JSON.stringify({
        context,
        'browseId': id
    })   
}
export const generateHeaders = (cookie: string): object => {
    const token = getAuthToken(cookie)
    return {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:72.0) Gecko/20100101 Firefox/72.0',
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.5',
      'Authorization': token,
      'Content-Type': 'application/json',
      'X-Goog-AuthUser': '0',
      'x-origin': 'https://music.youtube.com',
      'X-Goog-Visitor-Id': 'CgtvVTcxa1EtbV9hayiMu-P0BQ%3D%3D',
      'Cookie': cookie
    }
  }