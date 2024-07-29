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
### 协程(coroutine)
协程是线程之下的一个概念，由应用而不是操作系统执行，一个线程只能同时执行一个协程
### 使用promise作为执行器来执行生成器
原理就是使用promise包裹生成器，在then的时候去调用next
### co
> generator的缺点就是需要外层一直调用next方法，不会自动执行，使用promise进行包裹就可以把generator方法自动执行

使用方法`co(gen).then()`就可以自动执行并且返回一个promise
1. co内部生成一个promise并且返回
2. 执行生成器的next
3. 检查next返回值，如果生成器没有执行完的话，gen函数会返回promise，或者把返回值包装成promise，调用返回的promise.then，并且把next方法传进去
3. 重复第2步，一直到生成器执行完毕(gen.done)，然后调用resolve更改promise的状态

# async的原理
> async底层使用的就是promise和协程
1. 当执行async函数的时候，会新建一个协程
2. 执行协程，如果发现有await，执行await后面的表达式，检查结果
   1. thenable对象，在对象的then中添加协程的next方法
   2. 非thenable，使用Promise.resolve()进行包裹，再在then中添加next
3. async方法协程执行完毕，恢复主协程
4. 协程await中的promise在resolve的时候，往微任务队列中添加协程的next方法，执行的时候会重新唤起async方法协程，把之前的返回值赋值给await，重复第2步，直到async方法执行完成

# promise执行时序问题：
## promise.resolve()和new Promise(r => r())
### 区别
根据传入参数的不一样，返回的结果不一样
1. Promise实例
    - promise.resolve会直接返回这个Promise实例
    - new Promise会进行包裹##(这里要注意)##，生成PromiseResolveThenableJob进行包裹，并且这个Job会再生成一个then才执行原来的promise实例的then，总体来说会推后两个时序
2. thenable对象
    - 两者都会把thenable对象转成一个resolved状态的Promise实例，then方法会马上进入微任务队列
3. 其他数据
    - 两者都会转成一个result为当前数据的，状态为resolved的Promise实例
### 例子
```js
// v是一个实例化的promise，且状态为fulfilled
const v1 = Promise.resolve('v1')
const v2 = Promise.resolve('v2')

// 模式一 new Promise里的resolve()
// begin->v2->1->2->v1->3->4 可以发现v1比v2推迟了两个时序
// 推迟原因：浏览器会创建一个 PromiseResolveThenableJob 去处理这个 Promise 实例，这是一个微任务。
// 等到下次循环到来这个微任务会执行，也就是PromiseResolveThenableJob 执行中的时候，因为这个Promise 实例是fulfilled状态，所以又会注册一个它的.then()回调
// 又等一次循环到这个Promise 实例它的.then()回调执行后，才会注册下面的这个.then(),于是就被推迟了两个时序
new Promise(resolve => {
  resolve(v1);
})
.then(console.log);
// 我理解就是等同于：
// v1
// .then((res) => {
//   console.log('PRTJ')
//   return res
// })
// .then((res) => {
//   console.log('PRTJ的then回调')
//   return res
// })
// .then(console.log);

//  模式二 Promise.resolve(v)直接创建
// begin->v2->1->2->v1->3->4 可以发现v2的执行时间正常了，第一个执行的微任务就是下面这个.then
// 原因：Promise.resolve()API如果参数是promise会直接返回这个promise实例，不会做任何处理
Promise.resolve(v2)
.then(console.log);

Promise.resolve()
  .then(() => {
    console.log(1);
  })
  .then(() => {
    console.log(2);
  })
  .then(() => {
    console.log(3);
  })
  .then(() => {
    console.log(4);
  });

console.log('begin')
```

## async包裹问题
### 函数返回值
async函数的返回值使用`new Promise`进行包裹：
```js
const v1 = Promise.resolve('v1')
const v2 = Promise.resolve('v2')
async function af () {
  return v1
}
function fun() {
  return v2
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
console.log('before fun strat')
af().then(console.log)
fun().then(console.log)
console.log('fun complete')

// before fun strat -> fun complete -> 1 -> v2 -> 2 -> 3 -> v1 -> 4 -> 5
// v1比v2推迟了两个时序
```
### await返回值
await后面的返回值
- 使用Promise.resolve()做包裹（chrome77以后的实现）
- 使用new Promise包裹（chrome77 之前）


async返回值怎么做包裹：
```js
async function af () {
  console.log('af start')
  let afAwait = await Promise.resolve().then(() => {
    console.log('af await then')
    return 'af await'
  })
  console.log(afAwait)
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
console.log('strat')
af().then(() => console.log('af fun then'))
console.log('complete')
// start -> af start -> complete -> 1 -> af await then -> 2 -> af await -> 3 -> af fun then -> 4 -> 5
```
## promise执行时序问题
### TLDR;
`在Promise状态进行变化的时候，如果onFulfilled返回的res是一个Promise实例，则这个实例的then方法会比预期的延迟两个微任务时序`
### 详细解读
> [V8 Promise源码全面解读](https://juejin.cn/post/7055202073511460895#heading-0)

这里大概说明了Promise中的一些底层实现，其中指出，浏览器实际上并不是完全按照A+规范进行实现，在**Promise转化状态**的时候会出现特殊情况
1. new Promise(res => res(promise))
2. Promise.resolve().then(() => promise)
在这两种情况下，都产生了Promise状态的改变，并且传入的res都是一个promise

在Promise状态进行改变的时候，会触发`ResolvePromise`方法，这个方法传入两个参数：`promise`、`resolution`，第一个是Promise本身，第二个是用引起状态变化的函数的返回值，对应的也就是上面resolve传入的结果和then中onFulfilled的返回值

这个函数中会判断resolution是否是一个promise，如果是，则调用`NewPromiseResolveThenableJobTask`来生成一个微任务，注意的是这个微任务并不是传入的`promise.then`，而是一个单独处理的逻辑，大概实现是：
```js
// 首先这里会生成一个微任务，会占用一个时序
microtask(() => {
  // 这里也并不是直接执行，而是加一个resolution.then，虽然resolution是resolved状态，也要添加一个时序
  resolution.then((value) => {
    ReslovePromise(promise, value) 
  })
})
```
所以说会延迟两个时序，但是为什么Promise.resolved(promise)为什么没有延迟呢？这是因为Promise.resolved()生成出来的不是一个pending的promise，所以没有进入`ResolvePromise`方法
## 详细解读
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

# Promise题目的总结
1. `then`里面返回非函数会透传(生成一个新的Promise实例，值等于上一个Promise实例的值)
2. `Promise.resolved(promise)`会透传`promise`
3. `then`里面`onFulfilled`方法返回`Promise对象`会延迟两个时序变成`resolved`
4. `new Promise(resolve => resolve(promise))`同样如此
5. `async`函数返回值使用`new Promsie`包裹
6. `async`中`await`返回值使用`Promise.resolved()`包裹(chrome77后)

# 题目
```js
Promise.resolve().then(() => {
    console.log(0);
    return Promise.resolve(4);
}).then((res) => {
    console.log(res)
})

Promise.resolve().then(() => {
    console.log(1);
}).then(() => {
    console.log(2);
}).then(() => {
    console.log(3);
}).then(() => {
    console.log(5);
}).then(() => {
    console.log(6);
})
// 0 1 2 3 4 5 6
```
标准，延后两个时序，一个是thenableJob，一个是等待then
```js
Promise.resolve().then(() => {
    console.log(0);
    return {then(resolve){resolve(4)}};
}).then((res) => {
    console.log(res)
})

Promise.resolve().then(() => {
    console.log(1);
}).then(() => {
    console.log(2);
}).then(() => {
    console.log(3);
}).then(() => {
    console.log(5);
}).then(() => {
    console.log(6);
})
// 0 1 2 4 3 5 6
```
这里有问题了，很奇怪，跟上一题不一样
```js
// 首先这里会生成一个微任务，会占用一个时序
microtask(() => {
  // 这里也并不是直接执行，而是加一个resolution.then，虽然resolution是resolved状态，也要添加一个时序
  resolution.then((value) => {
    ReslovePromise(promise, value) 
  })
})
```
关键在于，这里是一个thenable对象，then是自己写的，Promise的then会把函数参数丢到微任务队列执行，但是这个是自己写的then，马上就执行了，所以只延迟了一个时序，是thenableJob的时序