infer是用来自动推断类型

## 推断函数返回类型
```ts
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : T;

type func = () => number;
type variable = string;
type funcReturnType = MyReturnType<func>; // funcReturnType 类型为 number
type varReturnType = MyReturnType<variable>; // varReturnType 类型为 string
```

## 推断函数参数类型
```ts
type MyParameters<T> = T extends (...args: infer P) => any ? P : any

function foo(arg1: string, arg2: number): void {}

type FooP = MyParameters<typeof foo>
// type FooP = [arg1: string, arg2: number]
```
## 获取数组的元素类型
```ts
type Ids = number[];
type Names = string[];

// 在之前，需要这样子做
type OldUnpacked<T> = T extends Names ? string : T extends Ids ? number : T;
// 使用infer就可以自动推断了
type Unpacked<T> = T extends (infer R)[] ? R : T;

type idType = Unpacked<Ids>; // idType 类型为 number
type nameType = Unpacked<Names>; // nameType 类型为string
```

## 解包promise
```ts
type MyAwaited<T> = T extends PromiseLike<infer U> ? MyAwaited<U> : T
```
如果T是一个(返回U的Promise)，则继续拆包，否则直接返回T

## 推断模板字符串
```ts
type PickValue<T> = T extends `${infer R}%` ? R : unknown;
type Value = PickValue<"50%"> // "50"
```

## 推断生成联合类型
```ts
type Foo<T> = T extends { a: infer U; b: infer U } ? U : never;

type T10 = Foo<{ a: string; b: string }>; // T10类型为 string
type T11 = Foo<{ a: string; b: number }>; // T11类型为 string | number
```
