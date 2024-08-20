 ### 题目

  实现内置的 `Exclude<T, U>` 类型，但不能直接使用它本身。

  > 从联合类型 `T` 中排除 `U` 中的类型，来构造一个新的类型。

  例如：

  ```ts
  type Result = MyExclude<'a' | 'b' | 'c', 'a'> // 'b' | 'c'

  type MyExclude<T, U> = T extends U ? never : T
  ```

  1. 对于联合类型来说，使用泛型的时候会对联合类型中的每一项都做处理，并且返回的时候把每一项的结果都拼接起来生成最终结果

