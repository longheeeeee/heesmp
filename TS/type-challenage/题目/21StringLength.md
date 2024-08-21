### 题目

计算字符串的长度，类似于 `String#length` 。

```ts
type LengthOfString<S extends string, T extends string[] = []> = S extends `${infer L}${infer Rest}` ? LengthOfString<Rest, [...T, L]> : T['length']
```

原理：因为字符串的length直接返回时number，数组的length能返回具体的数字，所以做法就是把字符串拆成数组，使用参数闭包来保存传递