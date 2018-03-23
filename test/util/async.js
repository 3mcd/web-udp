// @flow

export const tick = (t: number = 0): Promise<*> =>
  new Promise(resolve => setTimeout(resolve, t))
