import cookie from 'cookie'
/**
 * @ignore
 */
const sha1 = require('sha1')
import fetch from 'node-fetch'
import contextJSON from './context.json'
import headersJSON from './headers.json'
/**
 * @ignore
 */
const getSAPISID = (raw: string): string => {
  const parsed = cookie.parse(raw)
  return parsed['SAPISID']
}
/**
 * @ignore
 */
const getAuthToken = (raw_cookie: string): string => {
  const date = new Date().getTime()
  return `SAPISIDHASH ${date}_${sha1(
    date + ' ' + getSAPISID(raw_cookie) + ' ' + 'https://music.youtube.com'
  )}`
}
/**
 * @ignore
 */
export const generateBody = (args: {
  id?: string
  type?: string
  userID?: string
}): string | object => {
  const context: any = contextJSON.context
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
/**
 * @ignore
 */
export const generateHeaders = (cookie: string, authUser?: number): object => {
  const token = getAuthToken(cookie)
  if (!authUser) authUser = 0
  return {
    ...headersJSON,
    Authorization: token,
    'X-Goog-AuthUser': `${authUser}`,
    Cookie: cookie,
    'x-youtube-client-version': '0.1'
  }
}
/**
 * @ignore
 */
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
    authUser?: number
  }
) => {
  const headers: object = generateHeaders(c, args.authUser)
  const options: {
    method: string
    headers: any
    body: any
  } = {
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
  )
    .then((data) => data.json())
    .then((data) => {
      return data
    })
}

export function filterMap<T, R>(
  collection: T[],
  f: (item: T) => R | undefined | null
): R[] {
  const result: R[] = []
  for (const item of collection) {
    const mapped = f(item)
    if (mapped != null) {
      result.push(mapped)
    }
  }
  return result
}

export function filterFlatMap<T, R>(
  collection: T[],
  f: (item: T) => R[] | undefined | null
): R[] {
  const result: R[] = []
  for (const item of collection) {
    const mapped = f(item)
    if (mapped != null) {
      result.push(...mapped)
    }
  }
  return result
}

/**
 * Wraps a function that accepts input T and parses it into output R.
 * In the normal case, this is a no-op; if the function throws, however,
 * we will augment the thrown Error with context bout what was being parsed.
 */
export function parser<T, R>(f: (input: T) => R): (input: T) => R {
  return function parserWrapper(input: T) {
    try {
      return f(input)
    } catch (e) {
      throw new Error(
        `Unexpected error: ${e.message}\nParsing: ${JSON.stringify(
          input,
          null,
          2
        )}`
      )
    }
  }
}
