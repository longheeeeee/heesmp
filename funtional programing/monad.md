> 那么什么叫 monad 呢？它是一种设计模式。当你有一系列函数，这些函数接受一个类型且返回另外一个类型时，我们可以在其上应用两个函数使其可以进行复合操作：
> - bind 函数可以将任意的函数转换为输入和输出类型相同的函数（注：对于更宽泛的应用并不要求 bind 返回的函数的输入和输出类型一致），使其更易复合
> - unit 函数将一个值包裹进一个容器内使其被可复合函数接受

> 好了！像上面这样实现了 of, map, chain 方法且能够持有值的对象，就被称为 Monad。它能帮助我们解决「函数组合」和「异常处理」的问题，让我们可以自由安全地组合逻辑，做到函数粒度的逻辑复用：

我理解monad就是几个函数，或者是整合这几个函数的集合，使得一些纯函数可以进行拓展，从原本的`A => A`转成`B => B`，其中A是B的子集(在例子中B是添加了错误信息的A)。

主要是三个函数
1. unit/of方法，可以把简单参数A转成复杂参数B，比如添加默认错误信息
2. bind/chain方法，把A=>B变成B=>B，处理传入的错误信息，并且和新的错误信息进行合并和返回
3. lift/map方法，把A=>A变成A=>B(在一部分文章中，这个处理放在函数内部而不是使用新函数进行包裹)

```js
const combined = compose(bind(lift(f)), bind(lift(g)))
combined(unit(x))
```

## monad与副作用处理
我理解就是把一个处理流程拆开，然后逐步进行处理，把能确定的没有问题的语句拆开成不同的动作？然后只要确保这些动作输入输出没有问题，那么问题就会集中在产生副作用的IO操作上？

```js
function showReview() {
  const dataStr = localStorage.getItem('前端夜点心的数据');
  const data = JSON.parse(dataStr);
  const reviewData = data.review;
  const reviewOutput = reviewData.map(
    (count, index) => `第${index}篇文章的阅读量是${count}`
  ).join(',');
  console.log(reviewOutput);
}
```

拆分成
```js
// 把两个IO单独进行包裹
const readFromStorage = () => localStorage.getItem('前端夜点心的阅读量');
const writeToConsole = console.log;

// 使用一个叫IO的monad进行封装，实际上就是调用了这个fun
const storageIO = new IO(readFromStorage);

// 下面是几个处理函数，都是把数据从A=>B
const parseJSON = string => JSON.parse(string);
// 读取 review 字段
const getReviewProp = data => data.review;
// 把 review 字段拼装成字符串
const mapReview = reviewData => reviewData.map(
  (count, index) => `第${index}篇文章的阅读量是${count}`
).join(',');

// 组合上面的这些函数，得到新的 Monad
const task = storageIO
  .map(parseJSON) // 上面map方法的定义就是传入一个方法，使得A=>A变成A=>B
  .map(getReviewProp)
  .map(mapReview)

// 执行task，并且把最终的结果丢给writeToConsole
task.fork(writeToConsole);
```
上面就是实现了monad处理副作用，没感觉有什么很特殊的思想或者是什么，单纯的就是把IO拆分出来
```js
// 封装成根据key来获取storage的方法
const readByKey = key => new IO(() => localStorage.getItem(key));
const task = readByKey('firstKey') // 通过第一个 key 读取存储
  .map(parseJSON)
  .map(v => v.key) // 获取第二个 key
  // chain的定义是A=>B变成B=>B，使得函数可以接收同一个函数的执行结果，实现链式调用
  .chain(readByKey) // 通过第二个 key 读取存储
  .map(parseJSON)
```
总感觉这些都是跟promise的then是一样的，上一个的返回值丢给下一个，同时在文章里面也说明了
> 那另一个重要的 ES 对象 Promise 是否关于 then 方法成为 Monad 的呢？答案是否定的，根本原因在于，Promise 的 then 即可以像 map 那样直接处理类似上面 f 这样的函数，又能像 chain 那样处理 mf 那样的函数，它混淆了两个概念，这样的混淆会造成一些原本在其他 Monad 上成立的「重构等式」在 Promise 上不成立，故严格来说，不能把它算作 Monad （详见 stackoverflow - Why are Promises Monads? 下的第一个回答）。
我理解就是map和chain在monad这个概念上是应该分开的，虽然都是把上一个返回值丢给下一个，但是map是类似于formatter的概念，只是转换数据，真正干活的是chain

> - 方法混淆
>
>Task 的 map / chain / fork 在 Promise 中全都是 then 方法。这样的 API 设计让 Promise 更好用，但也失去了一些函数式的特性，尤其是 fork 和另两个方法的意义是完全不同的
>- 立即执行 vs 延迟执行
>
>Task 的异步流直到 fork 之前都仅仅是「动作」，没有「执行」，而 Promise 在生成的当下即发起了异步流程，这个的不同造成了这两种数据流程的根本不同。
> - 多次订阅 vs 单次调用
>
>因为上面执行时机的不同，Task 可以分化出很多不同的异步流程，每个流程都可以被多次 fork 执行，而 Promise 流程只会执行一次。
> - 异步微任务 vs 纯粹的回调
>
>即使是用 Promise 直接 resolve 一个结果，仍会生成一个异步微任务，排在在同步流程之后执行。这让 Promise 的数据流不适合兼容同步的数据流程。
而 Task 由于仅仅是纯粹一系列的函数回调组合，它只会根据需要产生异步流程，因而能够很好地兼容同步流程。IO 函子的所有支持的同步事务，用 Task 可以等价兼容。这使得「一种结构解决所有问题」的函数式目标成为可能。
> - 更灵活精确的流程控制
>
>通过对 Task 的改良，可以实现请求缓存，截流，防抖等多种细致的流程控制，实现对复杂逻辑的精细拆分。




- [[译]工程化：Javascript中的Monad](https://juejin.cn/post/6913775730258083848)
- [[译]工程化: promise is monad](https://juejin.cn/post/6913776948074250253)

- [函数式夜点心：Monad](https://juejin.cn/post/6844904073066479623)
- [函数式夜点心：IO Monad 与副作用处理](https://juejin.cn/post/6844904082390384653)
- [函数式夜点心：异步流程与 Task 函子](https://juejin.cn/post/6844904083573178375?from=search-suggest)