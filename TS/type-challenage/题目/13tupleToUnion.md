### 题目

实现泛型`TupleToUnion<T>`，它返回元组所有值的合集。

例如

```ts
type Arr = ['1', '2', '3']

type Test = TupleToUnion<Arr> // expected to be '1' | '2' | '3'

// 自动生成联合类型
type TupleToUnion<T extends any[]> = T[number]
// 正常一点是这样子，使用infer进行推断
type TupleToUnion<T> = T extends Array<infer ITEMS> ? ITEMS : never

```
