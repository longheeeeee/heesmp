```ts
  const tuple = ['tesla', 'model 3', 'model X', 'model Y'] as const

  type result = TupleToObject<typeof tuple> // expected { 'tesla': 'tesla', 'model 3': 'model 3', 'model X': 'model X', 'model Y': 'model Y'}

  // 要求是要从数组生成对象

  type TupleToObject<T extends readonly (string | number | symbol)[]> = {
    [key in T[number]]: key
  }
```

这里用了一个没有见过的方法`T[number]`，测试了一下，发现在数组中是可以使用`[number]`来获取整个数组的所有参数，并且生成一个联合类型
```ts
type Arr = ['123', 123]
type A = Arr[number]
// type A = "123" | 123
```
而同时使用对象则不行
```ts
type Obj = {
  abc: 'abc',
  123: 123
}
type B = Obj[string] // 这里报错
// 类型“Obj”没有匹配的类型“string”的索引签名。ts(2537)
```
在[这里](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html)写了用法