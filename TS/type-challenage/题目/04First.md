```ts
  type arr1 = ['a', 'b', 'c']
  type arr2 = [3, 2, 1]

  type head1 = First<arr1> // 应推导出 'a'
  type head2 = First<arr2> // 应推导出 3

  type First<T extends any[]> = T extends [] ? never : T[0]

  // 主要是为了解决空数组的情况
  Expect<Equal<First<[]>, never>>,
```