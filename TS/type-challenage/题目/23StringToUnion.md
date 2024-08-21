### 题目

实现一个将接收到的String参数转换为一个字母Union的类型。

例如

```ts
type Test = '123';
type Result = StringToUnion<Test>; // expected to be "1" | "2" | "3"
```

```ts
type StringToUnion<T extends string> = T extends `${infer L}${infer Rest}` ? (L | StringToUnion<Rest>) : never
```
1. 拿到第一个字符
2. 使用|进行迭代

