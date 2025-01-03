export const pipe = (...fns: Array<(arg: any) => any>) => (x: any) => 
  fns.reduce((v, f) => f(v), x)