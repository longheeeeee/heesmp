  ### 题目

  不使用 `Omit` 实现 TypeScript 的 `Omit<T, K>` 泛型。

  `Omit` 会创建一个省略 `K` 中字段的 `T` 对象。

  例如：

  ```ts
  interface Todo {
    title: string
    description: string
    completed: boolean
  }

  type TodoPreview = MyOmit<Todo, 'description' | 'title'>

  const todo: TodoPreview = {
    completed: false,
  }
  ```
  ```ts
  type MyOmit<T, K extends keyof T> = {[P in keyof T as P extends K ? never: P] :T[P]}
  ```
  没看懂，as在这里的作用是重命名，把`P in keyof T`重命名成`P`，不写as的话会报循环引用错误

  答案上贴了[一篇文章](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html#key-remapping-via-as)

  并不是，as这里的作用仍是断言，从一个大范围断言成一个小范围，加上括号的话就能知道，这里实际上是把T中的所有键名P`P in keyof T`，断言成never/P。
  ```ts
  type MyOmit<T, K extends keyof T> = {[P in keyof T as (P extends K ? never: P)] :T[P]}
  ```
  同理，我们可以使用这个来实现pick
  ```ts
  interface Todo {
    title: string
    description: string
    completed: boolean
  }
  type MyPick<T, K extends keyof T> = {[P in keyof T as K]: T[K]}

  type A = MyPick<Todo, 'title'>
  /**
    type A = {
      title: string;
    }
  */
  ```

  Vscode上的库，实现是
  ```ts
  type MyOmit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
  ```
  先拿到T的所有key，然后exclude掉其中的K，再使用Pick
