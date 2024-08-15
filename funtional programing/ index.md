# 科里化的实际应用
```js
const curry = (fn) => {
  const curried = (...args) => {
    if (args.length >= fn.length) return fn(...args)
    return (...args2) => curried(...[...args, ...args2])
  }
  return curried
};
const compose = (f, g) => (x) => f(g(x));
const map = curry((fn, arr) => arr.map(fn));

{
  // 比如说我们有一个数组，想要把每个数都加1
  const arr = [1, 2, 3]
  // add函数，对单个functor做操作
  const add = curry((a, b) => a + b)
  // add1函数，对单个functor做+1操作
  const add1 = add(1)
  // 对多个functor应用add1
  const arrAdd1 = map(add1)
  
  console.log(arrAdd1(arr))
}
{
  // 如果我们想要把一个数组的每一个数，先加上1，然后使用Obj进行包裹，返回{value: num}
  const arr = [1, 2, 3];
  // add函数，对单个functor做操作
  const add = curry((a, b) => a + b);
  // add1函数，对单个functor做+1操作
  const add1 = add(1);

  const toObj = curry((key, val) => {
    return ({
      [key]: val
    })
  });
  const numToObj = toObj('value');
  const wrapItem = compose(numToObj, add1);
  const wrapArr = map(wrapItem);
  console.log(wrapArr(arr));
}
```

- [简明 JavaScript 函数式编程——入门篇](https://juejin.cn/post/6844903936378273799)
- [函数式编程指北](https://llh911001.gitbooks.io/mostly-adequate-guide-chinese/content/ch4.html#%E4%B8%8D%E4%BB%85%E4%BB%85%E6%98%AF%E5%8F%8C%E5%85%B3%E8%AF%AD%E5%92%96%E5%96%B1)

