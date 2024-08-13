# 性能问题
在react中，在很多情况下，usecallback不能随便滥用，不但不会有性能优化，反倒是会造成额外的性能损耗。
## 会存在什么损耗？
useCallback在什么情况下有效？或者说useCallback是为了在什么情况下可以实现性能优化？
1. 子组件添加了Memo，并且子组件的所有props都被妥善的添加了缓存
只有在上述情况下，useCallback是有作用的，如果子组件对这个包裹了useCallback的props根本不关心传进去的是否造成了变更，那么我们多做了什么？
1. 执行了一下useCallback
2. 生成了一个函数
3. 生成了一个依赖数组
4. 做了依赖数据的浅比较

## 什么情况下需要使用？
1. 耗时计算需要添加useMemo
2. 引用对象是一个useEffect依赖的时候，为了避免不停执行，需要添加
3. 子组件使用了memo包裹，并且会依赖这个函数

## useCallback hell
```js
const Parent = (props) => {
  const { query } = props
  const fetchData = () => {
    return fetch(query)
  }
  return <Child fetchData={fetchData} />
}
const Child = (props) => {
  const { fetchData } = props
  // 在这种情况下，useEffect会重复执行
  useEffect(() => {
    fetchData()
  }, [fetchData])
}
```
为了解决上述的问题，比较好的解决方案有两个
1. 转移强刷逻辑，会造成逆向病毒式传播，导致前面所有的都需要包裹，并且排查难度大
```js
const Parent = (props) => {
  const { query } = props
  // 把强刷逻辑放在前面
  const fetchData = useCallback(() => {
    return fetch(query)
  }, [query])
  return <Child fetchData={fetchData} />
}
```
2. `useEventCallback`，把变更拦住，就算上游函数一直在变，但是下游使用ref进行包裹
```js
const useEventCallback = (fn) => {
  const ref = useRef()
  ref.current = fn
  return useState((...args) => {
    ref.current.apply(null, args)
  })[0]
}
```
