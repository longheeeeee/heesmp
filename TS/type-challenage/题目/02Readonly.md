```ts
type MyReadonly<T extends Object> = {
  readonly [key in keyof T]: T[key]
}
```
1. readonly 要放在最前面
2. in/keyof可以连着用