### 题目

实现一个为接口添加一个新字段的类型。该类型接收三个参数，返回带有新字段的接口类型。

例如:

```ts
type Test = { id: '1' }
type Result = AppendToObject<Test, 'value', 4> // expected to be { id: '1', value: 4 }
```

```ts
type AppendToObject<T extends Object, U extends string | number | symbol, V> = Omit<T, U> & Record<U, V>
```
这个很简单，但是官方给的equal有问题识别不了，所以需要进行包裹
```ts
type Compute<T extends object> = { [k in keyof T]: T[k] }

type AppendToObject<T extends Object, U extends string | number | symbol, V> = Compute<Omit<T, U> & Record<U, V>>
```