import * as utils from './utils'

export interface ContinuationData {
  nextContinuationData: {
    continuation: string,
    clickTrackingParams: string
  }
}

export interface ContinuationsContainer {
  continuations: {
    [index: number]: ContinuationData
  }
}

function pickContinuationObject(continuationContents: any) {
  for (const key of Object.keys(continuationContents)) {
    if (key.endsWith("Continuation")) {
      return continuationContents[key]
    }
  }
}

export function createContinuation<T, C>(
  cookie: string,
  args: { userID?: string, authUser?: number } | undefined,
  parseContents: (renderer: any) => C,
  baseObject: T,
  container?: ContinuationsContainer,
): (() => Promise<T>) | undefined {
  if (!(container?.continuations?.[0]?.nextContinuationData)) {
    return;
  }

  const continuation = container.continuations[0].nextContinuationData;

  return async () => {
    const body: any = utils.generateBody({ userID: args?.userID })
    const response = await utils.sendRequest(cookie, {
      endpoint: 'browse',
      body,
      cToken: continuation.continuation,
      itct: continuation.clickTrackingParams,
      authUser: args?.authUser
    })

    const data = pickContinuationObject(response.continuationContents);
    const content = parseContents(data.contents);
    const result = {
      ...baseObject,
      content,
      continue: createContinuation(cookie, args, parseContents, baseObject, data),
    };
    return result;
  }
}
