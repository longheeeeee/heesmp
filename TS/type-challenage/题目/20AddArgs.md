### 题目

> 由 @antfu 翻译

实现一个泛型 `AppendArgument<Fn, A>`，对于给定的函数类型 `Fn`，以及一个任意类型 `A`，返回一个新的函数 `G`。`G` 拥有 `Fn` 的所有参数并在末尾追加类型为 `A` 的参数。

```typescript
type Fn = (a: number, b: string) => number

type Result = AppendArgument<Fn, boolean>
// 期望是 (a: number, b: string, x: boolean) => number
```

```ts
type AppendArgument<Fn extends (...args: any) => any, A> = 
  Fn extends ((...args: infer Arg) => infer Return) 
    ? (...args: [...Arg, A]) => Return 
    : never
```

要注意的是，ts的函数要怎么写，也需要添加型参的名字定义
