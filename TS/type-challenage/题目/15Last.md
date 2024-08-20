### 题目

> 在此挑战中建议使用TypeScript 4.0

实现一个`Last<T>`泛型，它接受一个数组`T`并返回其最后一个元素的类型。

例如

```ts
type arr1 = ['a', 'b', 'c']
type arr2 = [3, 2, 1]

type tail1 = Last<arr1> // 应推导出 'c'
type tail2 = Last<arr2> // 应推导出 1
```

正常玩法
```ts
type Last<T extends any[]> = T extends [...infer _R, infer L] ? L : never
```
邪道玩法，主要是想用T.length - 1，没法用，只能往前塞一个没用的
```ts
type Last<T extends any[]> = [never, ...T][T['length']]
```
