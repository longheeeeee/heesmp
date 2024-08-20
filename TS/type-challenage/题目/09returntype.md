  ### 题目

  不使用 `ReturnType` 实现 TypeScript 的 `ReturnType<T>` 泛型。

  例如：

  ```ts
  const fn = (v: boolean) => {
    if (v)
      return 1
    else
      return 2
  }

  type a = MyReturnType<typeof fn> // 应推导出 "1 | 2"

  type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : T
  ```

infer只能使用在条件判断的子句里面，所以只能放在泛型的body里面，而不是入参的时候，比如
```ts
type MyReturnType<T extends (...args: any[]) => infer R> = R
```
会报错`仅条件类型的 "extends" 子句中才允许 "infer" 声明。ts(1338)`