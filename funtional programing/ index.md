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