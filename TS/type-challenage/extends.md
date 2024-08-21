extends有两种用法
1. 在参数中，用于限制参数，在参数不争取的情况下会报错
```ts
type ADD<T extends any[]> = T
```
2. 在返回中定义，用于条件判断是否属于，后面接三段式
```ts
type ADD<T> = T extends any[] ? T : never
```