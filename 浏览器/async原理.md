# 总结
async就是一个结合了生成器和promise的语法，其中使用生成器来暂停函数，使用promise来恢复函数。
1. 执行async函数的时候，会新建一个协程，然后父协程保存调用栈，并且把控制权交给子协程
2. 子协程执行，执行到await的时候
  1. 如果await是常量，就新建一个fulfiled状态的promise，并且调用这个promise的then方法，把子协程的next方法传进去，因为当前promise已经fulfiled了，这个then方法就会添加到微任务队列
  2. 如果await跟的是thenable，就会执行thenable的then方法，把子协程的next方法传进去
3. 子协程执行完毕，恢复主协程，主协程继续执行，到执行完毕执行微任务的时候，就会执行子协程的next方法，重新唤醒子协程，并且把await的返回值返回到子协程上。

# 生成器generator
### 生成器的使用
1. 在生成器内部执行一段代码，然后遇到yield就会返回关键字后面的内容给外部，并且暂停该函数的执行
2. 外部函数可以通过next方法恢复函数的执行
### 生成器的实现
使用协程这个概念，生成器函数会生成一个协程，然后调用next的时候，父协程保存当前调用栈，然后把控制权交给子协程，子协程执行到yield后，把结果返回给父协程，并且保存子协程的调用栈，恢复父协程的调用栈并交还控制权。
### 使用promise作为执行器来执行生成器
原理就是使用promise包裹生成器，在then的时候去调用next
### co的原理
0. co传入一个生成器，返回一个promise
1. co内部生成并返回一个Promise，执行生成器的next
2. 检查next返回值，如果生成器没有执行完的话，调用promise.then，并且把next方法传进去
3. 重复第2步，一直到生成器执行完毕，然后调用resolve更改这个promise的状态

# async的原理
1. 当执行async函数的时候，会新建一个协程
2. 执行协程，如果发现有await，就会新建一个Promise，promise会resolve await后面表达式的结果，然后promise的then方法中传入当前协程的next方法。如果await后面是一个常量的话，这个promise会马上变成fulfilled状态，然后then方法回调被添加到微任务队列。如果await后面跟的是一个thenable的话，会在这个thenable的then上添加协程的next方法。
3. （await常量情况下）协程执行完毕，恢复主协程，然后主协程执行，宏任务执行完毕后检查微任务检查点，微任务队列中有之前添加的then方法，执行的时候重新激活子协程。

# 问题：
async返回值怎么做包裹：
```js
async function a2 () {
  return Promise.resolve('a2Res')
}
async function a1 () {
  console.log('a1 start')
  let a1Await = await Promise.resolve('a2Res').then(() => {
    console.log('a1Await.then')
    return 100
  })
  console.log('a1Await', a1Await)
}

Promise.resolve()
.then(() => {
  console.log(1)
})
.then(() => {
  console.log(2)
})
.then(() => {
  console.log(3)
})
.then(() => {
  console.log(4)
})
.then(() => {
  console.log(5)
})
console.log('before a1 strat')
a1()
console.log('a1 complete')
```
- async返回值使用new Promise做包裹
- await后面的返回值使用Promise.resolve()做包裹（chrome77以后的实现）
- chrome77 之前使用new Promise包裹








[「译」更快的 async 函数和 promises](https://juejin.cn/post/6844903715342647310)
[令人费解的 async/await 执行顺序](https://juejin.cn/post/6844903762478235656)

下面是其他人对`resolveThenableJob`的思考[参考文章](https://juejin.cn/post/7055202073511460895)

> 注意: 此作业使用提供的 thenable 及其 then 方法来解决给定的 Promise。此过程必须作为作业进行，以确保在对任何周围代码的评估完成后对 then 方法进行评估。

引至 `ECMAScript NewPromiseResolveThenableJobTask 规范[27](作者翻译)`
什么是 thenable：
Javascript 为了识别 Promise 产生的一个概念，简单来说就是所有包含 then 方法的对象都是 thenable。
> 『以确保在对任何周围代码的评估完成后对 then 方法进行评估』

指的是什么呢？我唯一能想到的就是下面这种情况。
```js
const p1 = new Promise((resolve, reject) => {
    const p2 = Promise.resolve().then(() => {
        resolve({
            then: (resolve, reject) => resolve(1)
        });
        const p3 = Promise.resolve().then(() => console.log(2));
    });
}).then(v => console.log(v));
// 2 1
```
上面 p2 的 onFulfilled回调 会先进入 microtask 队列，等待其执行时 调用 p1 的 resolve，但是参数是一个包含 then 方法的对象。这时 p1 不会立即改变为 fulfilled，而是创建一个 microtask 来执行这个then方法，然后将 p2的 onFulfilled 加入 microtask 队列。这时 microtask 队列中有两个 microtask，一个是执行 resolve 返回值中的 then函数，另一个则是 p3的 onFulfilled 函数。

然后取出第一个 microtask 执行（取出后 microtask 队列中只剩下 p3的 onFulfilled），执行后 p1 的状态变为 fulfilled，然后 p1 的 onFulfilled 进入队列。后面可想而知是相继输出 2和1（因为 p1 的 onFulfilled 函数在 p3 的 onFulfilled 函数之后进入 microtask 队列）。

如果没有将 NewPromiseResolveThenableJobTask 作为一个 microtask。也就变成了 p2.then 中的回调执行时同步触发 resolve 参数中的 then 方法，fulfilled 的状态会立即同步到 p1,这时 p1 的 onFulfilled 就会先进入 microtask，导致结果变为 12。这样的执行结果可以会让JavaScript开发者感到疑惑。

所以 ECMAScript 将其作为一个异步任务来执行。