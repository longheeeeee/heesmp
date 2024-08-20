### 题目

给函数`PromiseAll`指定类型，它接受元素为 Promise 或者类似 Promise 的对象的数组，返回值应为`Promise<T>`，其中`T`是这些 Promise 的结果组成的数组。

```ts
const promise1 = Promise.resolve(3);
const promise2 = 42;
const promise3 = new Promise<string>((resolve, reject) => {
  setTimeout(resolve, 100, 'foo');
});

// 应推导出 `Promise<[number, 42, string]>`
const p = PromiseAll([promise1, promise2, promise3] as const)
```

```ts
declare function PromiseAll<T extends any[]>(values: readonly [...T]): Promise<{
  [key in keyof T]: Awaited<T[key]>
}>
```
网上的答案是这个，但是有个问题是，这个返回的是一个对象呀，可是实际上测试又是数组无误
```ts
type MyMap<T extends any[]> = {
  [key in keyof T]: '123'
}
type DD = MyMap<[1,2,3]>
// type DD = ["123", "123", "123"]
```
确实是，如果是一个数组的话，加上in keyof，实际上返回的是一个数组
