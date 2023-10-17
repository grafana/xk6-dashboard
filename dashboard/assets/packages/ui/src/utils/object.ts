export const safeProp = <T extends object>(prop: keyof T | undefined, xs: T) => prop && xs[prop]
