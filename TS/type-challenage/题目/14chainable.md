### 题目

在 JavaScript 中我们经常会使用可串联（Chainable/Pipeline）的函数构造一个对象，但在 TypeScript 中，你能合理的给它赋上类型吗？

在这个挑战中，你可以使用任意你喜欢的方式实现这个类型 - Interface, Type 或 Class 都行。你需要提供两个函数 `option(key, value)` 和 `get()`。在 `option` 中你需要使用提供的 key 和 value 扩展当前的对象类型，通过 `get` 获取最终结果。

例如

```ts
declare const config: Chainable

const result = config
  .option('foo', 123)
  .option('name', 'type-challenges')
  .option('bar', { value: 'Hello World' })
  .get()

// 期望 result 的类型是：
interface Result {
  foo: number
  name: string
  bar: {
    value: string
  }
}
```
要实现的是两个方面
1. 参数的传递
2. 参数可以添加，并且可以覆盖

1. 参数传递：泛型是一个函数，可以通过闭包来传递参数，option返回一个Chinable对象，并且通过默认值来实现初始化
```ts
type Chainable<T = {}> = {
  option: <K extends string, V>(key: K, value: V) => Chainable<T & Record<K, V>>
  get: () => T
}
```
2. 参数添加：在旧的对象中，剔除新传入的，再使用&进行合并
```ts
type Chainable<T = {}> = {
  option: <K extends string, V>(
      // 这里指的是，如果K已经存在T中了，则使用never来代表K不能是任何东西，来生成报错
      // 类型“string”的参数不能赋给类型“never”的参数。ts(2345)
      key: K extends keyof T ? never : K,
      value: V
    ) => Chainable<Omit<T, K> & Record<K, V>>;
  get: () => T;
};

```
