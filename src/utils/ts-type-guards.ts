// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isError = (e: any): e is Error => {
  return 'code' in e && 'message' in e;
};
