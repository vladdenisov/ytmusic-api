import cookie from 'cookie'
const sha1 = require('sha1')
import fetch from 'node-fetch'

const getSAPISID = (raw: string): string => {
  const parsed = cookie.parse(raw)
  return parsed['SAPISID']
}

const getAuthToken = (raw_cookie: string): string => {
  const date = new Date().getTime()
  return `SAPISIDHASH ${date}_${sha1(
    date + ' ' + getSAPISID(raw_cookie) + ' ' + 'https://music.youtube.com'
  )}`
}

export const generateBody = (args: {
  id?: string
  type?: string
  userID?: string
}): string | object => {
  const context: any = {
    client: {
      clientName: 'WEB_REMIX',
      clientVersion: '0.1',
      hl: 'en',
      gl: 'RU',
      experimentIds: [],
      experimentsToken: '',
      browserName: 'Edge Chromium',
      browserVersion: '84.0.522.15',
      osName: 'Windows',
      osVersion: '10.0',
      utcOffsetMinutes: 180,
      locationInfo: {
        locationPermissionAuthorizationStatus:
          'LOCATION_PERMISSION_AUTHORIZATION_STATUS_UNSUPPORTED'
      },
      musicAppInfo: {
        musicActivityMasterSwitch: 'MUSIC_ACTIVITY_MASTER_SWITCH_INDETERMINATE',
        musicLocationMasterSwitch: 'MUSIC_LOCATION_MASTER_SWITCH_INDETERMINATE',
        pwaInstallabilityStatus: 'PWA_INSTALLABILITY_STATUS_UNKNOWN'
      }
    },
    capabilities: {},
    request: {
      internalExperimentFlags: [
        {
          key: 'force_music_enable_outertube_playlist_detail_browse',
          value: 'true'
        },
        {
          key: 'force_music_enable_outertube_tastebuilder_browse',
          value: 'true'
        },
        {
          key: 'force_music_enable_outertube_album_detail_browse',
          value: 'true'
        },
        { key: 'force_music_enable_outertube_music_queue', value: 'true' },
        {
          key: 'force_music_enable_outertube_search_suggestions',
          value: 'true'
        }
      ],
      sessionIndex: 0
    },
    user: { enableSafetyMode: false },
    clickTracking: {
      clickTrackingParams: 'IhMI5aKttYiE6gIVhEGbCh0o9w8rMghleHRlcm5hbA=='
    },
    activePlayers: {}
  }
  if (args.userID) context.user.onBehalfOfUser = args.userID
  if (args.type)
    return JSON.stringify({
      context,
      browseEndpointContextSupportedConfigs: {
        browseEndpointContextMusicConfig: {
          pageType: 'MUSIC_PAGE_TYPE_' + args.type
        }
      },
      browseId: args.id
    })
  else if (args.id)
    return JSON.stringify({
      context,
      browseId: args.id
    })
  else return { context }
}
export const generateHeaders = (cookie: string): object => {
  const token = getAuthToken(cookie)
  return {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:72.0) Gecko/20100101 Firefox/72.0',
    Accept: '*/*',
    'Accept-Language': 'en-US,en;q=0.5',
    Authorization: token,
    'Content-Type': 'application/json',
    'X-Goog-AuthUser': '0',
    'x-origin': 'https://music.youtube.com',
    'X-Goog-Visitor-Id': 'CgtvVTcxa1EtbV9hayiMu-P0BQ%3D%3D',
    Cookie: cookie
  }
}
export const sendRequest = async (
  c: string,
  args: {
    id?: string
    type?: string
    body?: object
    endpoint: string
    userID?: string
    cToken?: string
    itct?: string
  }
) => {
  const headers: object = generateHeaders(c)
  const options: object = {
    method: 'POST',
    headers: headers,
    body: args.body
      ? JSON.stringify(args.body)
      : generateBody({ id: args.id, type: args.type, userID: args.userID })
  }
  const addParams: string = `${
    args.cToken
      ? 'ctoken=' +
        args.cToken +
        '&continuation=' +
        args.cToken +
        '&itct=' +
        args.itct +
        '&'
      : ''
  }`
  return fetch(
    `https://music.youtube.com/youtubei/v1/${args.endpoint}?${addParams}alt=json&key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30`,
    options
  ).then((data) => data.json())
}
