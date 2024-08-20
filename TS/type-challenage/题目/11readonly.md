### 题目

实现一个泛型`MyReadonly2<T, K>`，它带有两种类型的参数`T`和`K`。

类型 `K` 指定 `T` 中要被设置为只读 (readonly) 的属性。如果未提供`K`，则应使所有属性都变为只读，就像普通的`Readonly<T>`一样。

例如

```ts
interface Todo {
  title: string
  description: string
  completed: boolean
}

const todo: MyReadonly2<Todo, 'title' | 'description'> = {
  title: "Hey",
  description: "foobar",
  completed: false,
}

todo.title = "Hello" // Error: cannot reassign a readonly property
todo.description = "barFoo" // Error: cannot reassign a readonly property
todo.completed = true // OK
```
简单来说，我们可以把键值在遍历的时候进行区分，再分别匹配成readonly和其他的
```ts
type MyReadonly2<T, K extends keyof T> = {
  [key in keyof T]: key extends K ? readonly T[key] : T[key]
}
```
但是实际上readonly是不允许放在后面的，只能放在最前面`readonly [key in keyof T] : T[key]`。这样子我们就需要分开进行实现，把readonly的和其他的拆开成两个对象，然后再进行组合
```ts
type MyReadonly2<T, K extends keyof T = keyof T> = {
  [key in keyof T as key extends K ? never : key]: T[key]
} & {
  readonly [key in K]: T[key]
}
```
还有一个注意点是，第二个参数K可能为空，这样子我们就需要添加=作为默认值

这个题目上的是把对象的部分键值设置成readonly，但是官方的工具泛型是把整个都设置
```ts
type Readonly<T> = {
    readonly [P in keyof T]: T[P];
};
```