### 题目

实现一个泛型 `DeepReadonly<T>`，它将对象的每个参数及其子对象递归地设为只读。

您可以假设在此挑战中我们仅处理对象。不考虑数组、函数、类等。但是，您仍然可以通过覆盖尽可能多的不同案例来挑战自己。

例如

```ts
type X = {
  x: {
    a: 1
    b: 'hi'
  }
  y: 'hey'
}

type Expected = {
  readonly x: {
    readonly a: 1
    readonly b: 'hi'
  }
  readonly y: 'hey'
}

type Todo = DeepReadonly<X> // should be same as `Expected`
```
如果只是处理object的话，可以使用递归
```ts
type DeepReadonly<T extends Object> = {
  readonly [key in keyof T]: T[key] extends Object ? DeepReadonly<T[key]> : T[key]
}
```
这里的递归是，先判断是否是Object，再进递归，在issue上看到另外一种解法
```ts
type DeepReadonly<T> = keyof T extends never
  ? T
  : { readonly [k in keyof T]: DeepReadonly<T[k]> };
```
这个是先进入递归，再判断是否是object，这里有个问题，`T extends never`是什么？什么东西会是一个never的子集？

看到stckoverflow上有[相关的讨论](https://stackoverflow.com/questions/68693054/what-is-extends-never-used-for)

答者做了几个测试
```ts
type Hmm<T> = keyof T extends never ? true : false
type X1 = Hmm<{ a: string }> // false, "a" is a known key
type X2 = Hmm<{}> // true, there are no known keys
type X3 = Hmm<object> // true, there are no known keys
type X4 = Hmm<string> // false, there are keys like "toUpperCase"
type X5 = Hmm<
  { a: string } | { b: string }
> // true, unions with no common keys have no known keys
```
虽然看上去是实现了判断一个东西是否是object，但是这个是通过判断这个东西的key来实现的，如果是string，则还会有split等方法

同时，这个方法也会在特殊的情况下出现问题
```ts
type Z = DeepReadonly<{ a: string } | { b: string }> 
// type Z = {a: string} | {b: string}  OOPS
```
完全失效了，因为判断一个联合类型就是never