  ### 题目

  在类型系统里实现 JavaScript 的 `Array.includes` 方法，这个类型接受两个参数，返回的类型要么是 `true` 要么是 `false`。

  例如：

  ```ts
  type isPillarMen = Includes<['Kars', 'Esidisi', 'Wamuu', 'Santana'], 'Dio'> // expected to be `false`



  type Includes<T extends readonly any[], U> = 
    T extends [infer First, ...infer Rest] 
      ? Equal<First, U> extends true ? true : Includes<Rest, U> 
      : false
  ```
  判断逻辑
  1. 先判断是否是合法的，有值数组，不是则返回false
  2. 拿第一个出来，判断是否跟U相同，相同则返回True，否则拿Rest继续判断

  ```ts
  type AA = [] extends [infer First] ? true : false
  // AA = false

  type AA = [1] extends [infer First] ? true : false
  // AA = true
  ```
  这个是可以用来判断是否是一个有长度的数组