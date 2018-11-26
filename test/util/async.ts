export const tick = (t: number = 0): Promise<any> =>
  new Promise(resolve => setTimeout(resolve, t))
